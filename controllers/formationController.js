const { response } = require('express');
let Formation = require('../models/formationModel');
let Panier = require('../models/panierModel');
let User = require('../models/userModel');
let connection = require('../db');

let formationIDInscrit = [];
let formationInscrit = [];
let userList = [];
let finalisation = false;

exports.formationList = function(request, response){
    //affiche la liste des formations
    connection.query("SELECT * from formation;", function(error, resultSQL){
        if (error){
            console.log(error);
        } 
        response.render('home.ejs', {formation :resultSQL}); 
    });
};

exports.formationPanier = function(request, response){
    //affiche la liste de mes formations en panier
    response.render('panier.ejs', {formation : formationInscrit});
}

exports.formationConnection = function(req, res){
    //affiche mon ecran de connection
    res.render('connection.ejs');
}

exports.formationLogin = async function(req, res){
    //methode POST pour login
    let pseudo = req.body.pseudo;

    const sqlSearch = "SELECT * FROM connexion WHERE pseudo = ?";
    const search_query = connection.format(sqlSearch,[pseudo]);
    const sqlInsert = "INSERT INTO connexion VALUES (0,?)";
    const insert_query = connection.format(sqlInsert,[pseudo]);

    await connection.query (search_query, async (err, result) => {
        if (err) throw (err)
        if (result.length != 0) {
            //User existe deja
            req.session.loggedin = true;
            req.session.user = pseudo;
            if (finalisation==true){
                res.redirect('/formation/panier/encore/finalisation');
            }  
            else{
                res.redirect('/formation');
            }      
        } 
        else {
            await connection.query (insert_query, (err, result) => {
            //Nouveau user, je l'ajoute en DB
            if (err) throw (err)
            let user = new User(pseudo);
            userList.push(user);
            req.session.loggedin = true;
            req.session.user = pseudo;
            if (finalisation==true){
                res.redirect('/formation/panier/encore/finalisation');
            }  
            else{
                res.redirect('/formation');
            }    
            })
        }
    })
}

exports.formationInscription = function(req, res){
    //inscription des formations en panier
    let id = req.params.index;
    if (formationIDInscrit.includes(id)){
        res.redirect('/formation');
    }
    else {
        formationIDInscrit.push(id);
        connection.query("SELECT * from formation WHERE idformation = ? ", id, function(error, resultSQL){
            if (error){
                console.log(error);
            } 
            formationInscrit.push({
               "idformation": resultSQL[0].idformation,
               "Nom": resultSQL[0].Nom,
               "Prix": resultSQL[0].Prix,
               "Debut": resultSQL[0].Debut,
               "Fin": resultSQL[0].Fin
            });
            let panier = new Panier({
                "idformation": resultSQL[0].idformation,
                "Nom": resultSQL[0].Nom,
                "Prix": resultSQL[0].Prix,
                "Debut": resultSQL[0].Debut,
                "Fin": resultSQL[0].Fin
            })
            res.redirect('/formation');
        });
    }
}

exports.panierDelete = function(req, res){
    //effacement de formation dans mon panier
    let id = req.params.index;
    for (var i=0; i<formationInscrit.length; i++){
        if (id==formationInscrit[i].idformation){
            formationInscrit.splice(i,1);
            formationIDInscrit.splice(i,1);
        }
    }
    res.redirect('/formation/panier');
}

exports.panierFinaliser = function(req, res){
    //envoies du panier vers ma db
    var values = [];
    if(formationInscrit.length != 0){
       if(req.session.loggedin==true){
        const sqlInsert = "INSERT INTO pseudo_formation (pseudo_id, formation_id) VALUES ? ON DUPLICATE KEY UPDATE pseudo_id = pseudo_id";
        for (var i=0; i<formationInscrit.length; i++){
            values.push([req.session.user, formationInscrit[i].idformation]);
        }
        connection.query(sqlInsert, [values],function(err, result){
            if (err) throw err;
            formationInscrit=[];
            formationIDInscrit=[];
        })
        res.redirect('/formation');
        }
        else{
            res.redirect('/formation/connection');
            finalisation = true;
        } 
    }
    else{
        //si panier vide retour au choix de formation
        res.redirect('/formation');
    }
}
