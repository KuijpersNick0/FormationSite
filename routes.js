let express = require('express');
let router = express.Router();

let formationController = require('./controllers/formationController');

//utilisation session
let session = require('express-session');
router.use(session({
    secret: 'my secret',    //clé unique de la session
    resave: false,  
    saveUninitialized: true
}));

//Liste des routes vers controlleurs
router.get('/', (req, res) => res.redirect('/formation'));

router.get('/formation', formationController.formationList);
router.get('/formation/panier', formationController.formationPanier);
router.get('/formation/connection', formationController.formationConnection);
router.get('/formation/:index', formationController.formationInscription);
router.get('/formation/panier/:index', formationController.panierDelete);
router.get('/formation/panier/encore/finalisation', formationController.panierFinaliser);

router.post('/formation/connection',formationController.formationLogin);

module.exports = router;