# Documentation Backend 

Comment utiliser notre projet : HITEMA-BLOG

## Installer le projet

pour installer le projet sur votre PC, cloner le projet avec cette  ligne de commande

```bash
  git clone https://github.com/BLOG-HITEMA/backend.git
```
Et ensuite installer les dependencies
```bash
  cd backend
```
```bash
  npm install
```
Il va falloir créer un fichier `.env` dans la racine du projet et contient :
```bash
  CLE_TOKEN= `Mettez-ici ce que vous voulez`
  PORT=3001
  URL_MONGO= `Il vous faut une URL d'une BD Mongo` 
```
Et ensuite vous pouvez lancer le backend avec la commande
```bash
  npm start
```
