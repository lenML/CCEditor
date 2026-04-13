/**
 * cc editor 工具
 *
 * 1. 上下文是 card
 * 2. 需要提供 ui
 * 3. 应该是无副作用的不会修改 card，但是可以输出新 card
 */
export abstract class CCTool {
  constructor(public name: string, public desc: string) {}
  abstract component: React.FC<any>;
}
