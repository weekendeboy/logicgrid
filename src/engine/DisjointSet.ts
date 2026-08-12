/**
 * @license
 * Disjoint Set (Union-Find) Data Structure for Electrical Nets
 */

export class DisjointSet {
  parent: Record<string, string>;

  constructor() {
    this.parent = {};
  }

  makeSet(v: string) {
    if (!this.parent[v]) {
      this.parent[v] = v;
    }
  }

  find(v: string): string {
    if (this.parent[v] === v) return v;
    this.parent[v] = this.find(this.parent[v]);
    return this.parent[v];
  }

  union(a: string, b: string) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) {
      this.parent[rootA] = rootB;
    }
  }

  has(v: string): boolean {
    return this.parent[v] !== undefined;
  }
}
