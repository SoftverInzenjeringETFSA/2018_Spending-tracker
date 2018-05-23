var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');

var routerAPI = express.Router();

mongoose.connect('mongodb+srv://kamilica:C5iWryKT7srs1rIc@stcluster-4mwen.mongodb.net/SpendingTracker?retryWrites=true')
var db = mongoose.connection;
var Schema = mongoose.Schema;

var korisnikSchema = new Schema(
  {   ime: {
        type: String,
        validate: {
          validator: function(value){
            return /^[A-Z][a-z]{1,19}$/.test(value);
          },
          message: 'Ime mora počinjati velikim slovom i ne može sadržavati specijalne karaktere!'
        },
        required: [true, 'Obavezno je unijeti ime!']  
      }, 
      prezime: {
        type: String,
        validate: {
          validator: function(value){
            return /^[A-Z][a-z]{1,19}$/.test(value);
          },
          message: 'Prezime mora počinjati velikim slovom i ne može sadržavati specijalne karaktere!'
        },
        required: [true, 'Obavezno je unijeti prezime!'] 
      }, 
      lozinka: {
        type: String,
        validate: {
          validator: function(value){
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{7,20}$/.test(value); //bar jedno veliko slovo, jedna cifra, jedno malo slovo i duzina izmedju 7 i 20
          },
          message: 'Lozinka mora sadržavati bar 7 karaktera, od kojih bar jedno veliko slovo, bar jedno malo slovo i bar jednu cifru!'
        },
        required: [true, 'Obavezno je unijeti lozinku!'] 
      }, 
      mjesecniPrihod: Number,
      troskovniLimit: Number,
      valuta: String,
      email: {
        type: String,
        validate: {
          validator: function(value){
            return /^(([^<>()\[\]\\.,;:\s@"]+((\.(?!\.))*[^<>()\[\]\\.,;:\s@"]+)*))@[^<>()\[\]\\.,;:\s@_\-"]+\.[^<>()\[\]\\.,;:\s@_\-"]+$/.test(value);
          },
          message: 'Unesite validnu email adresu!'
        },
        required: [true, 'Obavezno je unijeti lozinku!'] 
        
      }, 
      kategorije: [
        { 
          naziv: {
            type: String,
            validate: {
              validator: function(value){
                return /^([a-z][0-9]*){3,19}$/.test(value);
              }
            }
          },  
        }
      ],
      racuni: [
        { 
          naziv: {
            type: String,
            validate: {
              validator: function(value){
                return /^([A-Za-z][0-9]*){3,19}$/.test(value);
              }
            }
          },  
          trenutniIznos: Number,
          troskovi: [
            { iznos: Number,
              datum: Date,
              kategorija: 
              {
                naziv: {
                  type: String,
                  required: true,
                  /*validate: {
                    validator: function(value){ //provjera da li postoji kategorija definisana ranije od tog korisnika
                      if(this.parent().kategorije.findIndex(kat => {return kat.naziv == value})==-1)
                        return false;
                      return true;
                    }
                  }*/
                },  
              }
            }
          ]
        }
      ]
    }
);

var korisnik = mongoose.model('korisnik', korisnikSchema, 'korisnik');

app.use(bodyParser.json());

//primjer api rute, vraca korisnika s poslanim imenom, prezimenom i lozinkom (u JSON formatu vraćeni podaci)
//ruta je localhost:8081/api/vratiKorisnika/:ime/:prezime/:lozinka
routerAPI.post('/vratiKorisnika', function(req, res) {
  //ovako uzimate parametre iz rute
  var email = req.body.email;
  var lozinka = req.body.lozinka;
  
  //query
  korisnik.findOne({'email':email, 'lozinka': lozinka}, function (err, person) {
    if (err) return handleError(err);
    res.send(person);
  });  
});


routerAPI.post('/vratiHistoriju', function(req, res) {
  var email = req.body.email;
  var lozinka = req.body.lozinka;
  
  
  korisnik.findOne({'email':email, 'lozinka': lozinka}, function (err, person) {
    if (err) return handleError(err);
    var datumi_iznosi = [];
    var brojac=0;
    if (person!=null)
    for(i=0; i<person.racuni.length; i++) {
      for(j=0; j<person.racuni[i].troskovi.length; j++) {
        if (person.racuni[i].troskovi[j].kategorija != null)
          datumi_iznosi[brojac] = {kategorija: person.racuni[i].troskovi[j].kategorija.naziv,
                                  iznos:person.racuni[i].troskovi[j].iznos,
                                  datum:person.racuni[i].troskovi[j].datum}
        brojac++;
      }
    }
    res.send(datumi_iznosi);
  });  
});

routerAPI.post('/vratiSveRacune', function(req, res) {
  var email = req.params.email;
  var lozinka = req.params.lozinka;
  
  var iznosi = [{
      value: 0,
      label: "Nepoznato"
    }];
    var brojac=1;
    if (person!=null)
    for(i=0; i<person.racuni.length; i++) {
      for(j=0; j<person.racuni[i].troskovi.length; j++) {
        var found = false;
        var indeks = 0;
        if(person.racuni[i].troskovi[j].kategorija.naziv == null) {
          iznosi[0].value += person.racuni[i].troskovi[j].iznos;
        } else {
        for(var k = 0; k < iznosi.length; k++) {
            if (iznosi[k].label == person.racuni[i].troskovi[j].kategorija.naziv) {
                found = true;
                indeks = k;
                break;
            }
        }
        if(found == false) {
          iznosi[brojac] = {
            value:person.racuni[i].troskovi[j].iznos,
            label: person.racuni[i].troskovi[j].kategorija.naziv
            }
          brojac++;
        } else {
          iznosi[indeks].value += person.racuni[i].troskovi[j].iznos;
        }
      }
      }
    }
    res.send(iznosi);
});

routerAPI.post('/vratiSveRacuneMjesec/:mjesec', function(req, res) {
  var email = req.body.email;
  var lozinka = req.body.lozinka;
  var mjesec = req.params.mjesec.toString();

  korisnik.findOne({'email':email, 'lozinka': lozinka}, function (err, person) {
    if (err) return handleError(err);
    var iznosi = [{
      value: 0,
      label: "Nepoznato"
    }];
    var brojac=1;
    if (person!=null)
    for(i=0; i<person.racuni.length; i++) {
      for(j=0; j<person.racuni[i].troskovi.length; j++) {
        var datum = (person.racuni[i].troskovi[j].datum).getMonth().toString() + "";
        if(datum.indexOf(mjesec)> -1) {
          var found = false;
          var indeks = 0;
          if(person.racuni[i].troskovi[j].kategorija.naziv == null) {
            iznosi[0].value += person.racuni[i].troskovi[j].iznos;
          } else {
            for(var k = 0; k < iznosi.length; k++) {
                if (iznosi[k].label == person.racuni[i].troskovi[j].kategorija.naziv) {
                    found = true;
                    indeks = k;
                    break;
                }
            }
            if(found == false) {
                iznosi[brojac] = {
                value:person.racuni[i].troskovi[j].iznos,
                label: person.racuni[i].troskovi[j].kategorija.naziv
                }
              brojac++;
            } else {
              iznosi[indeks].value += person.racuni[i].troskovi[j].iznos;
            }
          }
        }
      }
    }
    res.send(iznosi);
  });  
});

routerAPI.post('/vratiKategorije', function(req, res) {
  var email = req.body.email;
  var lozinka = req.body.lozinka;
  korisnik.findOne({'email': email, 'lozinka': lozinka}, function (err, person) {
    if (err) return handleError(err);
    res.send(person.kategorije);
  });  
});


routerAPI.post('/dodajNovuKategoriju', function(req, res) {
  var nazivKategorije = req.body.naziv;
  var email = req.body.email;
  var lozinka = req.body.lozinka;
   var opts = { runValidators: true, context: 'query', new: true };

  korisnik.findOneAndUpdate({'email': email, 'lozinka': lozinka}, {$push:{'kategorije': {'naziv': nazivKategorije}}}, opts, 
  function(err, doc){
    if (err) return res.send(500, { error: err });
    return res.send(doc.kategorije);
  });
});

// route middleware za validaciju :kategorija
routerAPI.param('kategorija', function(req, res, next, kategorija) {
  var email = req.body.email;
  var lozinka = req.body.lozinka;
  //kategorija moze imati samo slova i brojeve (i _)
  if(!/^\w+$/.test(kategorija)) {
    res.status(400)       
   .send('Bad request');
  }
  //provjere
  korisnik.findOne({'email':email, 'lozinka': lozinka}, function (err, person) {
    if (err) return handleError(err);
    if(person.kategorije.length == 0){
      
      res.statusMessage = 'Forbidden';
      res.status(403)       
      .send({error: 'Forbidden'});
    }
    else if(!person.kategorije.find(kat => {return kat.naziv == kategorija})){
      res.statusMessage = 'Forbidden';
      res.status(403)       
      .send({error: 'Forbidden'});
    }
    else if(person.kategorije.length == 1 && person.kategorije[0].naziv == kategorija){
      res.statusMessage = 'Forbidden';
      res.status(403)       
      .send({error: 'Forbidden'});
    }
    else{
      req.kategorija = kategorija;
      return next();
    }  
  });
});


routerAPI.post('/ukloniKategoriju/:kategorija', function(req, res) {
  var email = req.body.email;
  var lozinka = req.body.lozinka;
  var kategorija = req.params.kategorija;
  korisnik.findOneAndUpdate({'email':email, 'lozinka': lozinka}, {$pull:{'kategorije': {'naziv': kategorija}}}, {new: true}, 
  function(err, doc){
    if (err) return res.send(500, { error: err });
    return res.send(doc.kategorije);
  });
});

routerAPI.post('/dodajNoviTrosak/:racun', function(req, res) {
  var iznos = req.body.iznos;
  var email = req.body.email;
  var lozinka = req.body.lozinka;
  var racun = req.params.racun;
  var kategorija = req.body.kategorija;
  var danas = new Date();

  var opts = { runValidators: true, context: 'query', new: true };

  /*kompleksniji query ako nekom bude trebalo za rutu, traži se korisnik s 
  imenom, prezimenom i lozinkom koji su poslani kao parametri u GET metodi, onda se odabire racun koji ima naziv
  kao sto je poslan parametar ('racuni.naziv': racun) zatim se push-a novi objekat na listu racuna koji je 
  odabran(za to sluzi ovaj operator $ da bi se odabrao taj nadjeni racun iz prethodnog koraka)*/
  korisnik.findOneAndUpdate({'email':email, 'lozinka': lozinka, 'racuni.naziv': racun},
  {$push:{'racuni.$.troskovi': {'iznos': iznos, 'datum': danas, 'kategorija': {'naziv': kategorija}}}}, opts, 
  function(err, doc){
    if (err) return res.send(500, { error: err });
    return res.send("Dodan novi trošak");
  });
});

routerAPI.post('/trenutnoStanje', function(req,res){
  var email = req.body.email;
  var lozinka = req.body.lozinka;
  var racun = req.body.racun;

    korisnik.findOne({'email':email, 'lozinka': lozinka}, function (err, person) {
      if (err) return handleError(err);
      var tajRacun = person.racuni.find(rac => {return rac.naziv == racun});
     return res.send({'trenutniIznos': tajRacun.trenutniIznos});
    });  

});



routerAPI.post('/novoStanje/:racun', function(req,res){
  var noviIznos = req.body.noviIznos;

  var email = req.body.email;
  var lozinka = req.body.lozinka;
  var racun = req.params.racun;

  var opts = { runValidators: true, context: 'query', new: true };
  
  korisnik.findOneAndUpdate({'email':email, 'lozinka': lozinka, 'racuni.naziv': racun},
  {$set:{'racuni.$.trenutniIznos': noviIznos}}, opts, 
  function(err, person){
    if (err) return res.send(500, { error: err });
    return res.send("Umanjen iznos");
  });
});

routerAPI.post('/AzurirajProfil/:email/:lozinka', function(req,res){
  var password = req.body.password;
  var mjesecniPrihodi = req.body.mjesecniPrihod;
  var limit = req.body.limit;
  var valuta = req.body.valuta;
  var emailN = req.body.email;
  
  var email = req.params.email;
  var lozinka = req.params.lozinka;
  
  var opts = { runValidators: true, context: 'query', new: true };
  korisnik.findOneAndUpdate({'email':email, 'lozinka': lozinka},
  {$set:{'lozinka': lozinka,'troskovniLimit':limit,'mjesecniPrihod':mjesecniPrihodi, 'valuta': valuta, 'email': emailN}}, opts, 
  function(err, person){
  if (err) {
   return handleError(error);
  }
  res.send({poruka:"Bravo"});
  });
  });

app.get('/', function (req, res) {

    //ovako pravite query
    korisnik.find({}, function (err, person) {
        if (err) return handleError(err);
        console.log(person);
        res.send(person);
      });
  

})

app.use('/api', routerAPI);

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
})
