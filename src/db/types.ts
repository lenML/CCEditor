import type { SpecV3 } from "@lenml/char-card-reader";

/**
 * 代表存储在 IndexedDB 中的单个角色卡记录。
 */
export interface CardRecord {
  id: string; // 主键，随机生成的 UUID
  card: SpecV3.CharacterCardV3; // 角色卡核心数据
  avatarUrl?: string | null;
  createdAt: Date; // 记录的创建时间
  updatedAt: Date; // 记录的最后修改时间
}
