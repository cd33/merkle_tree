import { utils } from "ethers";

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
        if (
          this.layers[layerIndex - 1][i] === this.layers[layerIndex - 1][i + 1]
        ) {
          this.layers[layerIndex].push(this.layers[layerIndex - 1][i]);
        } else {
          this.layers[layerIndex].push(
            this.hash(
              this.layers[layerIndex - 1][i],
              this.layers[layerIndex - 1][i + 1]
            )
          );
        }
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
    console.log("hash :>> ", hash);
    let index = this.layers[0].findIndex((e: any) => e === hash);
    console.log("index :>> ", index);
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
      if (hash !== step) {
        let index = this.layers[i].findIndex((e: any) => e === step);
        const isRightNode = index % 2;
        isRightNode
          ? (hash = this.hash(hash, step))
          : (hash = this.hash(step, hash));
      }
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
const proof = tree.getProof(values[9]);
console.log("proof :>> ", proof);
console.log("verify :>> ", tree.verify(values[9], proof));

// Réflexions
// Cas 1 (6 values)
//                                     ROOT
//                   H4                         H5 = H3
//         H1                  H2               H3
// "XXX", "value1", "value2", "value3", "value4", "value5",
// value1, H2 et H5/H3
// 0x47230d0f5932fa2d220fce38668cb967425dbcf760480ee1a0ccfb43e717d65c
// 0x003d2e5db05a3e3c13f8f1bdefdf2553b513062dacda2055e2e65113fae470a0
// 0x491000780053e4f139823a31be7ef32f0eb13559e415d4f1f7a8ec30bf28396a

// Cas 2 (5 values)
//                                     ROOT
//                   H3                        value4
//         H1                  H2               value4
// "XXX", "value1", "value2", "value3", "value4", "value4"
// value1, H2 et value4
// 0x47230d0f5932fa2d220fce38668cb967425dbcf760480ee1a0ccfb43e717d65c
// 0x003d2e5db05a3e3c13f8f1bdefdf2553b513062dacda2055e2e65113fae470a0
// 0xafe1929419d2fb85a933b3cf1a54052fcb59c29ec28aeb33616e27fd5ae5a9d9

// Cas 3 (7 values)
//                                     ROOT
//                   H4                                     H5
//         H1                  H2                 H3                  value7
// "value1", "value2", "value3", "value4", "value5", "value6", "value7", "value7",
// value2, H2 et H5
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
//                                     ROOT                                                               value9
//                   H5                                     H6                                    value9         value9
//         H1                  H2                 H3                  H4                  value9          value9
// "value1", "value2", "value3", "value4", "value5", "value6", "value7", "value8", "value9", "value9",
// value2, H2, H6, value9
// 0x47230d0f5932fa2d220fce38668cb967425dbcf760480ee1a0ccfb43e717d65c
// 0x003d2e5db05a3e3c13f8f1bdefdf2553b513062dacda2055e2e65113fae470a0
// 0x7a0a734abc1cb644bb5c87377facd7365fd21599466af143069aacf559a9ee50
// 0xdcf0069f1d855e7d5bf2a67c968e92fc2592ec52258cd45e2339621bd627c372
