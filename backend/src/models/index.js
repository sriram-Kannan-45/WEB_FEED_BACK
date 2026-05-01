const { sequelize } = require('../config/db');
const User = require('./user');
const Training = require('./training');
const TrainerProfile = require('./trainerProfile');
const Enrollment = require('./enrollment');
const Feedback = require('./feedback');

const Notification = require('./notification');
const SurveyQuestion = require('./surveyQuestion');
const SurveyAnswer = require('./surveyAnswer');
const Note = require('./note');
const ActivityLog = require('./activityLog');

User.hasOne(TrainerProfile, {
  foreignKey: 'userId',
  as: 'profile'
});

TrainerProfile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Training, {
  foreignKey: 'trainerId',
  as: 'trainings'
});

Training.belongsTo(User, {
  foreignKey: 'trainerId',
  as: 'trainer'
});

Training.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

User.hasMany(Enrollment, {
  foreignKey: 'participantId',
  as: 'enrollments'
});

Enrollment.belongsTo(User, {
  foreignKey: 'participantId',
  as: 'participant'
});

Training.hasMany(Enrollment, {
  foreignKey: 'trainingId',
  as: 'enrollments'
});

Enrollment.belongsTo(Training, {
  foreignKey: 'trainingId',
  as: 'training'
});

User.hasMany(Feedback, {
  foreignKey: 'participantId',
  as: 'feedbacks'
});

Feedback.belongsTo(User, {
  foreignKey: 'participantId',
  as: 'participant'
});

Training.hasMany(Feedback, {
  foreignKey: 'trainingId',
  as: 'feedbacks'
});

Feedback.belongsTo(Training, {
  foreignKey: 'trainingId',
  as: 'training'
});

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Training.hasMany(SurveyQuestion, { foreignKey: 'trainingId', as: 'surveyQuestions' });
SurveyQuestion.belongsTo(Training, { foreignKey: 'trainingId', as: 'training' });

SurveyQuestion.hasMany(SurveyAnswer, { foreignKey: 'questionId', as: 'answers' });
SurveyAnswer.belongsTo(SurveyQuestion, { foreignKey: 'questionId', as: 'question' });

Feedback.hasMany(SurveyAnswer, { foreignKey: 'feedbackId', as: 'surveyAnswers' });
SurveyAnswer.belongsTo(Feedback, { foreignKey: 'feedbackId', as: 'feedback' });

User.hasMany(Note, { foreignKey: 'trainerId', as: 'notes' });
Note.belongsTo(User, { foreignKey: 'trainerId', as: 'trainer' });

Training.hasMany(Note, { foreignKey: 'trainingId', as: 'notes' });
Note.belongsTo(Training, { foreignKey: 'trainingId', as: 'training' });

module.exports = {
  sequelize,
  User,
  Training,
  TrainerProfile,
  Enrollment,
  Feedback,
  Notification,
  SurveyQuestion,
  SurveyAnswer,
  Note,
  ActivityLog
};