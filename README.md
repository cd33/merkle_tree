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

Dans l’exemple ci-dessous, les m sont les noeuds feuilles (déjà hachés).  
Si Bob veut prouver que « X » est bien dans l’arbre et qu’il n’a pas été falsifiée, il lui suffit d’envoyer à Alice le message X et quatre valeurs hachées, comme indiqué en violet dans le schéma ci-dessous :

<img src="/tree.png" alt="tree">

Si vous souhaitez en savoir plus :  
[https://cryptoast.fr/arbres-merkle-bitcoin/](https://cryptoast.fr/arbres-merkle-bitcoin/)  
[https://www.bitpanda.com/academy/fr/lecons/tout-ce-que-vous-devez-savoir-sur-les-arbres-de-merkle/](https://www.bitpanda.com/academy/fr/lecons/tout-ce-que-vous-devez-savoir-sur-les-arbres-de-merkle/)


## Explications
La fonction "init" prend en entrée une liste de données et calcule les empreintes cryptographiques (hash) de chaque élément de données en utilisant la fonction "keccak256". Elle calcule également le nombre de feuilles de l'arbre en vérifiant si le nombre de données est pair ou impair. S'il est impair elle copie le dernier élément.

La variable "layers" est utilisée pour stocker les différents niveaux de l'arbre de Merkle et pour accéder aux hash des noeuds de l'arbre lors des opérations de vérification d'intégrité.  
Chaque élément de la liste représente un niveau de l'arbre, et contient une liste des hash des noeuds de ce niveau.

La fonction "hash" prend en entrée deux hash ("leaf1" et "leaf2") et calcule un nouveau hash en combinant les deux, en prenant soin de retirer les deux premiers caractères de "leaf2" (0x) pour respecter le format attendu par la fonction "keccak256".

La fonction "getRoot" retourne le dernier hash du tableau "hashes", qui est la racine de l'arbre.

La fonction "getProof" prend en entrée une feuille ("leaf") et retourne une preuve de l'intégrité de cette feuille, en retournant les hash des noeuds internes qui mènent à la racine.

La fonction "verify" prend en entrée une feuille ("leaf") et une preuve d'intégrité ("proof").  
Pour chaque hash dans la preuve, elle calcule le hash du noeud interne en utilisant la fonction hash() en concatenant le hash de la feuille (puis enfant) de gauche et de droite.
Enfin, la fonction compare le hash obtenu à la fin de l'opération, à la racine de l'arbre getRoot(). Si les deux hash correspondent, cela signifie que la feuille est intègre et la fonction retourne true.