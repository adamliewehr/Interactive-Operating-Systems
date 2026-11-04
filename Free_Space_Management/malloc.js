class Malloc {
  constructor(size, start, policy, coalesce) {
    // size of space
    this.size = size;

    // init free list
    this.freelist = [];
    this.freelist.push((start, size));

    // keep track of ptr to size mappings
    this.sizemap = {};

    // policy
    this.policy = policy;
    // assert(this.policy in ['FIRST', 'BEST', 'WORST'])

    // this does a ridiculous full-list coalesce, but that is ok
    this.coalesce = coalesce;
  }
  addToMap(addr, size) {
    this.sizemap[addr] = size;
    // console.log("adding", addr, "to map of size", size);
  }
  malloc(size) {}
  free(addr) {}
  dump() {} // probably wont need this, as it is just for printing to the console
}
