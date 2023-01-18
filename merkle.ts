import { utils } from "ethers";

class MerkleTree {
  hashes: string[] = [];
  nbLeaves: number = 0;

  constructor(data: string[]) {
    this.init(data);
  }

  init(data: string[]) {
    this.hashes = data.map((val) => utils.keccak256(utils.toUtf8Bytes(val)));
    this.nbLeaves = data.length % 2 === 0 ? data.length : data.length + 1;
    let length: number = this.hashes.length;
    let offset: number = 0;

    while (length > 1) {
      if (length % 2 != 0) {
        this.hashes.push(this.hashes[this.hashes.length - 1]);
        length++;
      }
      for (let i = 0; i < length; i += 2) {
        this.hashes.push(
          this.hash(this.hashes[offset + i], this.hashes[offset + i + 1])
        );
      }
      offset += length;
      length /= 2;
    }
  }

  hash(leaf1: string, leaf2: string) {
    return utils.keccak256(leaf1 + leaf2.slice(2)); // Retire 0x, sinon le bytescode n'est pas valide
  }

  getRoot() {
    return this.hashes[this.hashes.length - 1];
  }

  verify(leaf: string, proof: string[]) {
    let hash = utils.keccak256(utils.toUtf8Bytes(leaf));

    for (let i = 0; i < proof.length; i++) {
      hash = this.hash(hash, proof[i]);
      // console.log('hash :>> ', hash);
    }
    return hash === this.hashes[this.hashes.length - 1];
  }
}

// TESTS
const values = [
  "value1",
  "value2",
  "value3",
  "value4",
  "value5",
  "value6",
  //   "value7",
  //   "value8",
  //   "value9",
];
const tree = new MerkleTree(values);
console.log("tree :>> ", tree);
console.log("getRoot :>> ", tree.getRoot());
const proof = [
  "0x47230d0f5932fa2d220fce38668cb967425dbcf760480ee1a0ccfb43e717d65c",
  "0x003d2e5db05a3e3c13f8f1bdefdf2553b513062dacda2055e2e65113fae470a0",
  "0x9f61445de9a278f3a9e4c7bef462174b1fc8a9d3bba5a12061f30620a889c29f",
];
console.log("verify :>> ", tree.verify(values[0], proof));
