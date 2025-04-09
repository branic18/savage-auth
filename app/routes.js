module.exports = function(app, passport, mongoose, caloricCollection) {

// normal routes ===============================================================

const { ObjectId } = require('mongodb');

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    const CaloricIntake = require('./models/CaloricIntake'); // Import the Mongoose model

    app.get('/profile', isLoggedIn, async function(req, res) { 
    caloricCollection.find().toArray((err, result) => { // This is the controller - "If the get /profile hears a request go talk to this controller"
        if (err) return console.log(err)
        
        // console.log("Fetched data:", result);

        res.render('profile.ejs', { // Pass into to the profile.ejs. This sets the header to HTML
          user : req.user, // pass eveyrthing about the user here off of the req object. Automatically passed through with each request; can console.log to see
          'caloric-intake-gen': result,
        })
      })

    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// calculation routes ===============================================================

    // const ObjectId = mongoose.Types.ObjectId;  
    // const userId = new ObjectId(req.user._id);  // convert the userId from string to ObjectId

    // form submission and calculate caloric intake
    app.post("/api/user", (req, res) => {

        const userId = new ObjectId(req.user._id);

      const { age, sex, height, weight, activity, goalAction } = req.body; // These are from the name attributes in the ejs file

      console.log('Form Data:', req.body);
      console.log('User object:', req.user);
      console.log('User ID:', req.user._id);


      
      // Parsing user inputs
      const parsedHeight = parseFloat(height); 
      const parsedWeight = parseFloat(weight); 
      const parsedAge = parseInt(age); 
      const activityFactor = parseFloat(activity);  



      // Was parsing was a success?
      if (isNaN(parsedHeight) || isNaN(parsedWeight) || isNaN(parsedAge) || isNaN(activityFactor)) {
      return res.status(400).send('Invalid input values.');
      }

      // calculatig the BMR
      let bmr;
      if (sex === 'female') {
          bmr = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge - 161;  // Female equation
      } else {
          bmr = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge + 5;    // Male equation
      }

      // calculate TDEE based on activity level
      const tdee = bmr * activityFactor;

      console.log('Goal Action:', goalAction);

      // adjustigg for weight goal
      let dailyCalories;
      switch (goalAction) {
          case 'maintain-goal':
              dailyCalories = tdee;
              break;
          case 'lose-goal-one':
              dailyCalories = tdee - 500;
              break;
          case 'lose-goal-half':
              dailyCalories = tdee - 250;
              break;
          case 'gain-weight-one':
              dailyCalories = tdee + 500;
              break;
          case 'gain-weight-half':
              dailyCalories = tdee + 250;
              break;
          default:
            console.log('Invalid goalAction:', goalAction); 
            return res.status(400).send(`Invalid goal action received: ${goalAction}`);
        }

      console.log('Calculated Daily Calories:', dailyCalories);

      // Did I do dailyCalories right?
      if (isNaN(dailyCalories)) {
      return res.status(500).send('Error calculating daily caloric intake.')};

      console.log('Age:', parsedAge);
      console.log('Weight:', parsedWeight);
      console.log('Height:', parsedHeight);
      console.log('Activity Factor:', activityFactor);
      console.log('BMR:', bmr);
      console.log('TDEE:', tdee);
      console.log('Daily Calories:', dailyCalories);

      // saving the caloric intake to the CaloricIntake model
      const caloricIntakeData = new CaloricIntake({
        userId: userId,
        weightGoal: goalAction, // using goalAction here as the weight goal
        activity: activity,   
        weight: parsedWeight, 
        height: parsedHeight,  
        sex: sex,           
        age: parsedAge,
        bmr: bmr.toFixed(0),
        tdee: tdee.toFixed(0),
        dailyCalories: dailyCalories.toFixed(0),
        });

        if (!req.user || !req.user._id) {
            return res.status(400).send('User is not authenticated or ID missing.');
          }          

        console.log('Attempting to save:', caloricIntakeData);


      console.log('Express is handling the form') 
      
      console.log(req.body) // So I can see the values from the <form> element inside req.body

            caloricCollection.insertOne(caloricIntakeData)
            .then(result => {
            res.redirect('/profile'); 
            })
            .catch(error => {
            console.error(error);
            res.status(500).send('Error saving data');
            });

    }); // END OF POST REQUEST
     

    

   

app.put("/api/user/caloric-intake", (req, res) => {
    console.log('Received PUT request with data:', req.body);

    // taking these from the request body
    const { userId, age, sex, height, weight, activityLevel, goalAction } = req.body;

    if (!userId || age === undefined || sex === undefined || height === undefined || weight === undefined || activityLevel === undefined || goalAction === undefined) {
        console.error("Missing fields:", { userId, age, sex, height, weight, activityLevel, goalAction });
        return res.status(400).send("Missing required fields.");
    }

    let bmr;
    if (sex === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * activityLevel;

    let dailyCalories;
    switch (goalAction) {
        case 'maintain-goal':
            dailyCalories = tdee;
            break;
        case 'lose-goal-one-to-two':
            dailyCalories = tdee - 500;
            break;
        case 'lose-goal-half-pound':
            dailyCalories = tdee - 250; 
            break;
        case 'gain-weight-one-to-two':
            dailyCalories = tdee + 500;
            break;
        case 'gain-weight-half-pound':
            dailyCalories = tdee + 250; 
            break;
        default:
            return res.status(400).send("Invalid goal action.");
    }

    console.log({
        age, sex, height, weight, activityLevel, goalAction, bmr, tdee, dailyCalories
    });

    db.collection('caloric-intake-gen')
        .findOneAndUpdate(
            { _id: ObjectId(userId) }, 
            {
                $set: {
                    bmr: bmr,
                    tdee: tdee,
                    dailyCalories: dailyCalories,
                    goalAction: goalAction, 
                    activityLevel: activityLevel,
                }
            },
            {
                returnDocument: 'after', 
                upsert: true  
            },
            (err, result) => {
                if (err) {
                    console.error('Error updating caloric intake:', err);
                    return res.status(500).send('Error updating caloric intake.');
                }

                res.send({ message: "Caloric intake updated successfully.", data: result.value });
            }
        );
});

    


    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') }); // Find out what flash method is
        }); // User sees the response

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', { // looks in passport file , uses the user model on line 7, then look in user.js file (hash is here, you never want to store passwords in plain text. You always ant to hash it)
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages. Show the user why they failed
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) { 
    if (req.isAuthenticated()) // If authenticated return it
        return next(); // Function built into express

    res.redirect('/'); // If not redirect the user to the homepage
}