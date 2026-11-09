class Malloc {
  constructor(size, policy, coalesce) {
    // size of space
    this.size = size;

    // init free list
    this.freelist = [];
    this.freelist.push([0, size]);

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
  malloc(size) {
    let bestAddr, bestSize;
    let bestIdx = -1;

    if (this.policy == "BEST") {
      bestSize = this.size + 1;
    } else if (this.policy == "WORST" || this.policy == "FIRST") {
      bestSize = -1;
    }

    // let count = 0; // this simply counts how many free list elements we went thorugh
    // its just so the user can see how many elements were searched. we can remove this in our simulation for simplicity.

    for (let i = 0; i < this.freelist.length; i++) {
      let eaddr = this.freelist[i][0];
      let esize = this.freelist[i][1];
      // count += 1;

      // console.log("inside if");
      // console.log(this.policy);
      // console.log(
      //   esize >= size &&
      //     ((this.policy == "BEST" && esize < bestSize) ||
      //       (this.policy == "WORST" && esize > bestSize) ||
      //       this.policy == "FIRST"),
      // );
      // console.log(esize >= size);
      // console.log(this.policy == "BEST");
      if (
        esize >= size &&
        ((this.policy == "BEST" && esize < bestSize) ||
          (this.policy == "WORST" && esize > bestSize) ||
          this.policy == "FIRST")
      ) {
        /* in plain english this says: 
                if the size of the current freelist chunk we are checking is greater than or equal to the size of the process we are allocating AND
                if the policy if BEST, we set the current bestSize we've found if its SMALLER 
                if the policy if WORST, we set the current bestSize we've found if its BIGGER
                if the policy if FIRST, we set the current bestSize and break 
               */
        bestAddr = eaddr;
        bestSize = esize;
        bestIdx = i;
        if (this.policy == "FIRST") {
          break;
        }
      }
    }

    if (bestIdx != -1) {
      // if we've acutally found something

      if (bestSize > size) {
        // the space we found does not fit perfectly for the process' size, so we need to split the chunk we found into 2
        //  print('SPLIT', bestAddr, size)
        // this edits that free list instance, by setting it to the current address+size up until the size of that chunk-the size of the allocated process
        this.freelist[bestIdx] = [bestAddr + size, bestSize - size];
        this.addToMap(bestAddr, size);
      } else if (bestSize == size) {
        // ''' the space we found DOES fit perfectly for the process' size, so no need to split'''
        //  print('PERFECT MATCH (no split)', bestAddr, size)
        // ''' we simply just pop that section out of the free list'''
        this.freelist.splice(bestIdx, 1);
        this.addToMap(bestAddr, size);
      } else {
        console.log("should never get here");
      }
      // return [bestAddr, count];
      return bestAddr;
    }

    console.log("*** FAILED TO FIND A SPOT", size);
    // return [-1, count];
    return -1;
  }
  free(addr) {
    //  simple back on end of list, no coalesce
    if (!this.sizemap[addr]) {
      return -1;
    }

    let size = this.sizemap[addr];

    //  sort by the address number. this is changed from the original. they had many different options for sorting the free list. I am just going to sort by the address
    this.freelist.push([addr, size]);
    // original line: this.freelist = sorted(self.freelist, key=lambda e: e[0])
    // i think this line does the same thing??
    this.freelist.sort((a, b) => Number(a[0]) - Number(b[0]));

    // # not meant to be an efficient or realistic coalescing...
    if (this.coalesce == true) {
      this.newlist = [];
      this.curr = this.freelist[0];
      // console.log(this.curr);
      for (let i = 1; i < this.freelist.length; i++) {
        let eaddr = this.freelist[i][0];
        let esize = this.freelist[i][1];
        if (eaddr == this.curr[0] + this.curr[1]) {
          this.curr = [this.curr[0], this.curr[1] + esize];
        } else {
          this.newlist.push(this.curr);
          this.curr = [eaddr, esize];
          // this.curr[0] = eaddr;
          // this.curr[1] = esize;
        }
      }
      this.newlist.push(this.curr);
      this.freelist = this.newlist;
    }

    delete this.sizemap[addr];
    return 0;
  }
  dump() {
    console.log(`Free List [ Size ${this.freelist.length} ]: `);
    for (const e of this.freelist) {
      console.log(`[ addr:${e[0]} sz:${e[1]} ]`);
    }
    console.log("");
  } // probably wont need this, as it is just for printing to the console
}
