import { utils } from "ethers";

// A perfect binary tree is a type of binary tree in which every internal node has exactly two child nodes and all the leaf nodes are at the same level.
class MerkleTree {
  layers: any[] = [];
  nbLeaves: number = 0;

  constructor(data: string[]) {
    this.init(data);
  }

  init(data: string[]) {
    const hashes = data.map((val) => utils.keccak256(utils.toUtf8Bytes(val)));
    this.layers = [hashes];
    this.nbLeaves = data.length % 2 === 0 ? data.length : data.length + 1;
    let length: number = hashes.length;

    while (length > 1) {
      const layerIndex = this.layers.length;
      this.layers.push([]);
      if (length % 2 != 0) {
        this.layers[layerIndex - 1].push(
          this.layers[layerIndex - 1][this.layers[layerIndex - 1].length - 1]
        );
        length++;
      }
      for (let i = 0; i < length; i += 2) {
        this.layers[layerIndex].push(
          this.hash(
            this.layers[layerIndex - 1][i],
            this.layers[layerIndex - 1][i + 1]
          )
        );
      }
      length /= 2;
    }
  }

  hash(leaf1: string, leaf2: string) {
    return utils.keccak256(leaf1 + leaf2.slice(2)); // Retire 0x, sinon le bytescode n'est pas valide
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }

  getProof(leaf: string) {
    let proof: string[] = [];
    const hash = utils.keccak256(utils.toUtf8Bytes(leaf));
    let index = this.layers[0].findIndex((e: any) => e === hash);
    if (index === -1) return proof;

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const isRightNode = index % 2;
      const pairIndex = isRightNode ? index - 1 : index + 1;

      if (pairIndex < layer.length) {
        proof.push(layer[pairIndex]);
      }

      index = (index / 2) | 0;
    }
    return proof;
  }

  verify(leaf: string, proof: string[]) {
    let hash = utils.keccak256(utils.toUtf8Bytes(leaf));
    if (proof.length === 0) return false;
    proof.forEach((step, i) => {
      let index = this.layers[i].findIndex((e: any) => e === step);
      const isRightNode = index % 2;
      isRightNode
        ? (hash = this.hash(hash, step))
        : (hash = this.hash(step, hash));
    });
    return hash === this.getRoot();
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
  "value7",
  "value8",
  "value9",
];
const tree = new MerkleTree(values);
console.log("tree :>> ", tree);
console.log("getRoot :>> ", tree.getRoot());
const proof = tree.getProof(values[8]);
console.log("proof :>> ", proof);
console.log("verify :>> ", tree.verify(values[8], proof));




// Réflexions
// Cas 1 (6 values)
//                                     ROOT
//                   H5                                      H6
//         H1                  H2                  H3                  H3
// "XXX", "value1", "value2", "value3", "value4", "value5"
// value1, H2 et H6
// 0x47230d0f5932fa2d220fce38668cb967425dbcf760480ee1a0ccfb43e717d65c
// 0x003d2e5db05a3e3c13f8f1bdefdf2553b513062dacda2055e2e65113fae470a0
// 0x9f61445de9a278f3a9e4c7bef462174b1fc8a9d3bba5a12061f30620a889c29f

// Cas 2 (5 values)
//                             ROOT
//                   H4                        H5
//         H1                  H2               H3        H3
// "XXX", "value1", "value2", "value3", "value4", "value4"
// value1, H2 et H5
// 0x47230d0f5932fa2d220fce38668cb967425dbcf760480ee1a0ccfb43e717d65c
// 0x003d2e5db05a3e3c13f8f1bdefdf2553b513062dacda2055e2e65113fae470a0
// 0x9c4c99c930fbe01585de1a01fe7debc19cb1492a6b4f760414f7160a02718433

// value2, H1, H5
// 0x5bfd235e4d2abc06aa681fe4eaa4d46ab5d249b8030c91de4434eb55ac6cdb5a
// 0x078f835b517053e9aa9f32871dfdf2befd4e99d57015add0d28750581846c804
// 0x9c4c99c930fbe01585de1a01fe7debc19cb1492a6b4f760414f7160a02718433

// Cas 3 (7 values)
//                                     ROOT
//                   H5                                     H6
//         H1                  H2                 H3                  H4
// "value1", "value2", "value3", "value4", "value5", "value6", "value7", "value7",
// value2, H2 et H6
// 0x47230d0f5932fa2d220fce38668cb967425dbcf760480ee1a0ccfb43e717d65c
// 0x003d2e5db05a3e3c13f8f1bdefdf2553b513062dacda2055e2e65113fae470a0
// 0xfdf964de04041714b598765d50ea21bcb14842742452d5b7fa9440975a32ef0e

// Cas 4 (8 values)
//                                     ROOT
//                   H5                                    H6
//         H1                  H2                 H3                  H4
// "value1", "value2", "value3", "value4", "value5", "value6", "value7", "value8",
// value2, H2 et H6
// 0x47230d0f5932fa2d220fce38668cb967425dbcf760480ee1a0ccfb43e717d65c
// 0x003d2e5db05a3e3c13f8f1bdefdf2553b513062dacda2055e2e65113fae470a0
// 0x7a0a734abc1cb644bb5c87377facd7365fd21599466af143069aacf559a9ee50

// Cas 5 (9 values)
//                                     H9                                                               H10
//                   H6                                     H7                                    H8         H8
//         H1                  H2                 H3                  H4                  H5          H5
// "value1", "value2", "value3", "value4", "value5", "value6", "value7", "value8", "value9", "value9",
// value2, H2, H7, H10
// 4: value3, H1, H7, H10
// 4: value3, H1, H7, H10 !!!
// 8: value7, H3, H6, H10
// 0x47230d0f5932fa2d220fce38668cb967425dbcf760480ee1a0ccfb43e717d65c
// 0x003d2e5db05a3e3c13f8f1bdefdf2553b513062dacda2055e2e65113fae470a0
// 0x7a0a734abc1cb644bb5c87377facd7365fd21599466af143069aacf559a9ee50
// 0xdcf0069f1d855e7d5bf2a67c968e92fc2592ec52258cd45e2339621bd627c372

// Cas 1 (5 values)
//                             ROOT
//                   H4                        H5
//         H1                  H2               H3        H3
// "value1", "value1", "value2", "XXX", "value4", "value4"
// value2, H1, H5
// 0x5bfd235e4d2abc06aa681fe4eaa4d46ab5d249b8030c91de4434eb55ac6cdb5a
// 0x078f835b517053e9aa9f32871dfdf2befd4e99d57015add0d28750581846c804
// 0x9c4c99c930fbe01585de1a01fe7debc19cb1492a6b4f760414f7160a02718433

// Cas 2 (5 values)
//                             ROOT
//                   H4                        H5
//         H1                  H2               H3        H3
// "value1", "value1", "value2", "value3", "XXX", "XXX"
// XXX, H3, H4
// 0xafe1929419d2fb85a933b3cf1a54052fcb59c29ec28aeb33616e27fd5ae5a9d9
// 0x8f354956f44b7f4abcc8a513d4478cfbd41f42de16d41921212d123fa4bff9f9
// 0x1e5bdbc72a87ed09b2f899c5fb7c67631a1460e88602f47b22b949d45ce6de0c
