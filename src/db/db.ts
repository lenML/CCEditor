import { openDB, type IDBPDatabase } from "idb";
import type { CardRecord } from "./types";
import { uuid } from "../common/uuid";

// --- 常量定义 ---
const DB_NAME = "CharacterCardDB"; // 数据库名称，更通用
const DB_VERSION = 1; // 数据库版本
const STORE_NAME = "cardStore"; // 对象存储名称
const UPDATED_AT_INDEX = "updatedAtIndex"; // 按更新日期排序的索引
const CREATED_AT_INDEX = "createdAtIndex"; // 按创建日期排序的索引

/**
 * 用于创建新角色卡记录的数据类型，ID 和时间戳将自动生成。
 */
export type NewCardData = Omit<CardRecord, "id" | "createdAt" | "updatedAt">;

/**
 * CardDB 类
 * 采用单例模式，封装了所有与角色卡 IndexedDB 存储相关的操作。
 * 它是应用程序与数据库交互的唯一入口点。
 */
class CardDB {
  private static instance: CardDB;
  private dbPromise: Promise<IDBPDatabase>;

  private constructor() {
    this.dbPromise = this.initDB();
  }

  /**
   * 获取 CardDB 的全局唯一实例。
   */
  public static getInstance(): CardDB {
    if (!CardDB.instance) {
      CardDB.instance = new CardDB();
    }
    return CardDB.instance;
  }

  /**
   * 初始化数据库和对象存储。
   * 此方法仅在数据库首次创建或版本号增加时执行。
   */
  private async initDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
          });
          // 为 createdAt 和 updatedAt 字段创建索引，以便高效排序
          store.createIndex(CREATED_AT_INDEX, "createdAt");
          store.createIndex(UPDATED_AT_INDEX, "updatedAt");
          console.log(`Object store '${STORE_NAME}' and its indexes created.`);
        }
      },
    });
  }

  public create(cardData: NewCardData): CardRecord {
    const now = new Date();
    const newRecord: CardRecord = {
      ...cardData,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    return newRecord;
  }

  public async addRecord(newRecord: CardRecord): Promise<string> {
    const db = await this.dbPromise;

    try {
      await db.add(STORE_NAME, newRecord);
      return newRecord.id;
    } catch (error) {
      console.error("Failed to add card record:", error);
      throw error;
    }
  }

  /**
   * 在数据库中添加一条新的角色卡记录。
   * @param cardData - 新角色卡的数据。
   * @returns {Promise<string>} 新创建记录的 ID。
   */
  public async add(cardData: NewCardData): Promise<string> {
    const newRecord = this.create(cardData);
    return this.addRecord(newRecord);
  }

  /**
   * 根据 ID 获取单个角色卡记录。
   * @param id - 记录的 ID。
   * @returns {Promise<CardRecord | undefined>} 找到的记录或 undefined。
   */
  public async get(id: string): Promise<CardRecord | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, id);
  }

  /**
   * 获取所有存储的角色卡记录，并可按日期排序。
   * 这个方法非常适合用来实现“最近编辑”、“历史记录”或“按创建时间排序”等视图。
   * @param sortBy - 排序字段：'updatedAt' (默认) 或 'createdAt'。
   * @param order - 排序方向：'desc' (降序，最新的在前，默认) 或 'asc' (升序)。
   * @returns {Promise<CardRecord[]>} 角色卡记录数组。
   */
  public async getAll(
    sortBy: "updatedAt" | "createdAt" = "updatedAt",
    order: "desc" | "asc" = "desc"
  ): Promise<CardRecord[]> {
    const db = await this.dbPromise;
    const indexName =
      sortBy === "updatedAt" ? UPDATED_AT_INDEX : CREATED_AT_INDEX;
    const direction = order === "desc" ? "prev" : "next";
    const records: CardRecord[] = [];

    const tx = db.transaction(STORE_NAME, "readonly");
    const index = tx.store.index(indexName);
    let cursor = await index.openCursor(null, direction);

    while (cursor) {
      records.push(cursor.value);
      cursor = await cursor.continue();
    }

    await tx.done;
    return records;
  }

  /**
   * 更新一个已存在的角色卡记录。
   * 会自动更新 'updatedAt' 时间戳。
   * @param id - 要更新记录的 ID。
   * @param updates - 包含要更新字段的对象。
   * @returns {Promise<void>}
   */
  public async update(
    id: string,
    updates: Partial<NewCardData>
  ): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const existingRecord = await store.get(id);

    if (!existingRecord) {
      throw new Error(`Card record with id ${id} not found.`);
    }

    const updatedRecord: CardRecord = {
      ...existingRecord,
      ...updates,
      updatedAt: new Date(), // 自动更新修改时间
    };

    await store.put(updatedRecord);
    await tx.done;
  }

  /**
   * 根据 ID 删除一个角色卡记录。
   * @param id - 要删除记录的 ID。
   * @returns {Promise<void>}
   */
  public async delete(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
  }

  /**
   * 清空数据库中所有的角色卡记录。
   * @returns {Promise<void>}
   */
  public async clear(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
  }
}

// --- 导出单例 ---
// 在你的应用中，只需导入这个 cardDB 对象即可使用所有数据库功能。
export const cardDB = CardDB.getInstance();
