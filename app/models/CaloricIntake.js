const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const caloricIntakeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Link to User model
    required: true
  },
  age: {
    type: String,
    enum: [
        '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', 
        '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', 
        '44', '45', '46', '47', '48', '49', '50', '51', '52'
      ],
    // enum restricts the field to only accept one of the values listed in the enum array. If someone tries to assign a value to age that is not part of the enum, Mongoose will throw a validation error when trying to save the document.
    required: true
  },
  sex: {
    type: String,
    enum: ['female', 'male'], 
    required: true
  },
  height: {
    type: Number, // In centimeters (or inches depending on your input)
    required: true
  },
  weight: {
    type: Number, // In kilograms (or pounds)
    required: true
  },
  activity: {
    type: String,
    enum: ['1.2', '1.375', '1.55', '1.725', '1.9'], // example activity levels
    required: true
  },
  weightGoal: {
    type: String,
    enum: ['maintain-goal', 'lose-goal-one-to-two', 'lose-goal-half-pound', 'gain-weight-one-to-two', 'gain-weight-half-pound'], 
    required: true
  },
  bmr: {
    type: Number, 
    required: true
  },
  tdee: {
      type: Number,
      required: true
  },
  dailyCalories: {
      type: Number,
      required: true
  }
});

// Create and export the model
const CaloricIntake = mongoose.model('CaloricIntake', caloricIntakeSchema, 'caloric-intake-gen');

module.exports = CaloricIntake;
