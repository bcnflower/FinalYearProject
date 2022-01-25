# Final Year Project By FA17-CSE-043+011+025+051

## Coding By Muhammad Faizan Saeed

## Installing and Running

1. Install Global dependencies
``` bash
npm install -g truffle webpack webpack-cli webpack-dev-server nodemon
```
2. Install dependencies from package.json
Although all dependencies are already included in "node_mudules", you can install them by following command
``` bash
npm i
```
3a. Start Truffle Block Chain:
``` bash
truffle develop 
truffle(develop)> compile
truffle(develop)> migrate --reset
```
Make sure that in file "myConfig.json" port is equal to 9545

## OR
3b. Start Ganache Block Chain:
i.Open Ganache.
ii.New Workspace
iii.Change name
iv.Add Project then select "truffle-config.js" 
v.On tab "ACCOUNTS & KEYS" you can see MNEMONIC. You can Backup it to use it later.
vi.SAVE WORKSPACE
vii.Open command prompt in the project folder.
viii.Run following command:
``` bash
truffle compile
truffle migrate --reset
```
Make sure that in file "myConfig.json" port is equal to 7545 or any port you select while setting up Ganache.


4. To Auto Update Project (ABI & Contract Address):
Run Following command:
On Windows:
```bash
prod.bat
```
On Linux and Mac OS:
```bash
npm run build:prod
```

5. To Run Server:
5a. Using nodemon library (Used if you want to make changing, auto restarts server after changing):
```bash
nodemon --ignore myConfig.json server.js
```
5b. Using just nodejs:
```bash
node server.js
```
You can visit website on your local device at address http://127.0.0.1:8080
Or anywhere on your network at address http://[Your-IP]:8080


## Configuration

Directories:
- src: contains all the source files, subfolders for js, css, img and external ressources
- dist: production files served with server.js in root directory

Webpack:
- copy external files with CopyWebpackPlugin
- minify with terser
- transpile js with @babel/preset-env
- transpile scss
- bundle images
- use 'externals' key to make webpack aware of external libraries
