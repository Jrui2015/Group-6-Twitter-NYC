/* eslint-disable no-param-reassign */
class Node {
  static id = 0;

  constructor(bounds, data = null, root = false) {
    [this.l, this.t, this.r, this.b] = bounds.map(e => +e);
    this.w = this.r - this.l;
    this.h = this.b - this.t;

    this.isLeaf = root || data != null;
    this.data = data;
    this.nodes = [];

    this.id = Node.id++;
    this.size = data ? 1 : 0;
    this.centroid = data ? [this.data.x, this.data.y] : [0, 0];
  }

  find(item, cb) {
    if (isNaN(item.x) || isNaN(item.y)) { return this; }
    let node = this;
    if (cb) { cb(node, item); }
    while (node.nodes.length) {
      const index = node.findIndex(item);
      if (!node.nodes[index]) break;
      node = node.nodes[index];
      if (cb) { cb(node, item); } // update node status along the path
    }
    return node;
  }

  findIndex(item) {
    const [x, y] = [item.x, item.y];
    const xm = (this.l + this.r) / 2;
    const ym = (this.t + this.b) / 2;
    const toRight = x > xm;
    const toBottom = y > ym;
    return (toRight << 1) | toBottom;
  }

  split(index, data = null) {
    const bounds = this.getSubRect(index);
    const node = this.nodes[index] = new Node(bounds, data);
    return node;
  }

  getSubRect(index) {
    let [l, t, r, b] = [this.l, this.t, this.r, this.b];
    const toRight = (index >> 1) & 1;
    const toBottom = index & 1;
    const xm = (l + r) / 2;
    const ym = (t + b) / 2;
    if (toRight) l = xm; else r = xm;
    if (toBottom) t = ym; else b = ym;
    return [l, t, r, b];
  }

  insert(item) {
    if (!item || isNaN(item.x) || isNaN(item.y)) { return this; }

    // case: empty tree
    if (this.isLeaf && !this.data) {
      this.data = item;
      this.size++;
      this.centroid = [item.x, item.y];
      return this;
    }

    // case: link identical items to avoid infinite loop
    // case: link items in a very small area (i.e. a point)
    const leaf = this.find(item, nd => {
      nd.centroid = [
        (nd.centroid[0] * nd.size + item.x) / (nd.size + 1),
        (nd.centroid[1] * nd.size + item.y) / (nd.size + 1),
      ];
      nd.size++;
    });
    if ((leaf.data && item.x === leaf.data.x && item.y === leaf.data.y) ||
        (leaf.w === 0 || leaf.h === 0)) {
      leaf.next = { data: item, next: leaf.next };
      return this;
    }

    const item2 = leaf.data;
    // case: insert item into intermediate branch
    if (!item2) {
      const index = leaf.findIndex(item);
      leaf.split(index, item);
      return this;
    }

    // case: normal, split current item into subtree
    leaf.data = null;
    leaf.isLeaf = false;

    let node = leaf;
    let index;
    let index2;
    do {
      index = node.findIndex(item);
      index2 = node.findIndex(item2);
      if (index === index2) {
        node = node.split(index);
        node.size += 2;
        node.centroid = [(item.x + item2.x) / 2, (item.y + item2.y) / 2];
      }
    } while (index === index2);

    node.split(index, item);
    node.split(index2, item2);
    return this;
  }

  // callback: (Node, data, left, top, right, bottom) => noFurtherVisitSubNodes?
  visit(callback, followNext = true) {
    if (followNext && this.next) {
      for (let point = this.next; point; point = point.next) {
        callback(this, point.data, this.l, this.t, this.r, this.b);
      }
    }
    const stop = callback(this, this.data, this.l, this.t, this.r, this.b);
    if (!stop) { this.nodes.filter(e => e).forEach(e => e.visit(callback, followNext)); }
  }

  nodesInBounds(bounds, minWidth) {
    const nodes = [];
    const [bl, bt, br, bb] = bounds;
    this.visit((nd, _, l, t, r, b) => {
      if (l - bl > minWidth &&
          t - bt > minWidth &&
          br - r > minWidth &&
          bb - b > minWidth) {
        nodes.push(nd);
        return true;
      }
      return (r < bl || l > br || b < bt || t > bb);
    }, false);
    // fallback to bigger scope
    if (!nodes.length) {
      this.visit((nd, _, l, t, r, b) => {
        if ((bl <= l && l <= br) ||
            (bl <= r && r <= br) ||
            (bt <= t && t <= bb) ||
            (bt <= b && b <= bb)) {
          nodes.push(nd);
          return true;
        }
        return (r < bl || l > br || b < bt || t > bb);
      });
    }
    return nodes;
  }

  getNodeNumber() {
    return Node.id - this.id;
  }
}


export default class QuadTree {
  constructor(bounds, nodes = []) {
    this.root = new Node(bounds, null, true);
    nodes.forEach(e => this.root.insert(e));
  }

  insert(item) {
    return this.root.insert(item);
  }

  nodesInBounds(bounds, minWidth) {
    return this.root.nodesInBounds(bounds, minWidth);
  }
}
