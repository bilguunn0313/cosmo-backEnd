import Odoo from "odoo-await";
import { OdooUser, OdooConfig, OdooSearchCondition } from "../types/odoo.types";
import { OdooConnectionError, NotFoundError, AppError } from "../utils/errors";

class OdooService {
  private odoo: Odoo;
  private isConnected: boolean = false;
  private config: OdooConfig;

  constructor(config: OdooConfig) {
    this.config = config;
    this.odoo = new Odoo({
      baseUrl: config.baseUrl,
      db: config.db,
      username: config.username,
      password: config.password,
    });
  }

  /**
   * Ensure connection to Odoo
   */
  private async ensureConnection(): Promise<void> {
    if (this.isConnected) return;

    try {
      const connected = await this.odoo.connect();
      if (!connected) {
        throw new OdooConnectionError("Failed to establish connection to ERP");
      }
      this.isConnected = true;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new OdooConnectionError(
        error instanceof Error ? error.message : "Unknown connection error"
      );
    }
  }

  /**
   * Authenticate user with Odoo
   */
  async authenticateUser(
    email: string,
    password: string
  ): Promise<OdooUser | null> {
    try {
      // Create temporary instance with user credentials
      const userOdoo = new Odoo({
        baseUrl: this.config.baseUrl,
        db: this.config.db,
        username: email,
        password: password,
      });

      const connected = await userOdoo.connect();
      if (!connected) {
        return null;
      }

      // Fetch user details
      const users = await this.getUserByEmail(email);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        500,
        error instanceof Error ? error.message : "Authentication failed"
      );
    }
  }

  /**
   * Get all users from Odoo
   */
  async getAllUsers(): Promise<OdooUser[]> {
    await this.ensureConnection();

    try {
      const users: OdooUser[] = await this.odoo.searchRead(
        "res.users",
        [],
        [
          "id",
          "name",
          "login",
          "password",
          "email",
          "partner_id",
          "company_id",
          "active",
          "create_date",
          "write_date",
        ]
      );

      return users;
    } catch (error) {
      throw new AppError(
        500,
        error instanceof Error ? error.message : "Failed to fetch users"
      );
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<OdooUser> {
    await this.ensureConnection();

    try {
      const users: OdooUser[] = await this.odoo.searchRead(
        "res.users",
        [["id", "=", id]],
        [
          "id",
          "name",
          "login",
          "password",
          "email",
          "partner_id",
          "company_id",
          "active",
          "create_date",
          "write_date",
          "role",
        ]
      );

      if (!users || users.length === 0) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      return users[0];
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        500,
        error instanceof Error ? error.message : "Failed to fetch user"
      );
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<OdooUser[]> {
    await this.ensureConnection();

    try {
      const users: OdooUser[] = await this.odoo.searchRead(
        "res.users",
        [["login", "=", email]],
        ["id", "name", "login", "email", "partner_id", "company_id", "active"]
      );

      return users;
    } catch (error) {
      throw new AppError(
        500,
        error instanceof Error ? error.message : "Failed to fetch user by email"
      );
    }
  }

  /**
   * Get active users only
   */
  async getActiveUsers(): Promise<OdooUser[]> {
    await this.ensureConnection();

    try {
      const users: OdooUser[] = await this.odoo.searchRead(
        "res.users",
        [["active", "=", true]],
        ["id", "name", "login", "email", "partner_id", "company_id"]
      );

      return users;
    } catch (error) {
      throw new AppError(
        500,
        error instanceof Error ? error.message : "Failed to fetch active users"
      );
    }
  }

  /**
   * Generic search method for flexibility
   */
  async search<T = any>(
    model: string,
    domain: OdooSearchCondition[],
    fields: string[]
  ): Promise<T[]> {
    await this.ensureConnection();

    try {
      const results: T[] = await this.odoo.searchRead(model, domain, fields);
      return results;
    } catch (error) {
      throw new AppError(
        500,
        error instanceof Error ? error.message : `Failed to search ${model}`
      );
    }
  }
}

// Singleton instance
let odooServiceInstance: OdooService | null = null;

export const getOdooService = (): OdooService => {
  if (!odooServiceInstance) {
    const config: OdooConfig = {
      baseUrl: process.env.ERP_URL!,
      db: process.env.ERP_DB!,
      username: process.env.ERP_USER!,
      password: process.env.ERP_PASSWORD!,
    };

    odooServiceInstance = new OdooService(config);
  }

  return odooServiceInstance;
};

export default OdooService;
