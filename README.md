# MERKLE TREE
Implémentation simple d'un arbre de merkle, réalisé en TypeScript.

## Commandes
```
npm install
npx ts-node .\merkle_complete.ts
```
## Rappel
Les arbres de Merkle sont essentiels pour réduire les quantités de données qui doivent être conservées dans une blockchain à des fins de vérification.

<img src="/basic.avif" alt="basic">

Dans l’exemple ci-dessous, les m sont les nœuds feuilles (déjà hachés).  
Si Bob veut prouver que « X » est bien dans l’arbre et qu’il n’a pas été falsifiée, il lui suffit d’envoyer à Alice le message X et quatre valeurs hachées, comme indiqué en violet dans le schéma ci-dessous :

<img src="/tree.png" alt="tree">

Si vous souhaitez en savoir plus :  
[https://cryptoast.fr/arbres-merkle-bitcoin/](https://cryptoast.fr/arbres-merkle-bitcoin/)  
[https://www.bitpanda.com/academy/fr/lecons/tout-ce-que-vous-devez-savoir-sur-les-arbres-de-merkle/](https://www.bitpanda.com/academy/fr/lecons/tout-ce-que-vous-devez-savoir-sur-les-arbres-de-merkle/)


## Explications
La fonction "init" prend en entrée une liste de données et calcule les hashes de chaque élément de données en utilisant la fonction "keccak256". Elle calcule également le nombre de feuilles de l'arbre en vérifiant si le nombre de données est pair ou impair. S'il est impair je copie le dernier élément.

La fonction "hash" prend en entrée deux empreintes cryptographiques ("leaf1" et "leaf2") et calcule un nouveau hash en combinant les deux, en prenant soin de retirer les deux premiers caractères de "leaf2" (0x) pour respecter le format attendu par la fonction "keccak256".

La fonction "getRoot" retourne la dernière empreinte cryptographique du tableau "hashes", qui est la racine de l'arbre.

La fonction "getProof" prend en entrée une feuille ("leaf") et retourne une preuve de l'intégrité de cette feuille en parcourant l'arbre des feuilles jusqu'à la racine.

La fonction "verify" prend en entrée une feuille ("leaf") et vérifie l'intégrité de cette feuille en utilisant la preuve obtenue avec la fonction "getProof" et en comparant le résultat avec la racine de l'arbre obtenue avec la fonction "getRoot".  
Dans un véritable cas d'utilisation, c'est l'utilisateur qui doit fournir la preuve (il n'y a pas getProof au sein de verify).