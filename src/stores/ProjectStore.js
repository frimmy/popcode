var _ = require('lodash');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ProjectActions = require('../actions/ProjectActions');
var ProjectConstants = require('../constants/ProjectConstants');
var Storage = require('../services/Storage');

var CHANGE_EVENT = 'change';

var _projects = {};

function generateProjectKey() {
  var date = new Date();
  return (date.getTime() * 1000 + date.getMilliseconds()).toString();
}

Storage.all().then(function(results) {
  results.forEach(function(result) {
    ProjectActions.loadFromStorage(result);
  });
});

var ProjectStore = _.assign({}, EventEmitter.prototype, {
  get: function(projectKey) {
    return _projects[projectKey];
  },

  all: function() {
    return _.values(_projects);
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

ProjectStore.dispatchToken = AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case ProjectConstants.PROJECT_SOURCE_EDITED:
      var project = ProjectStore.get(action.projectKey);
      project.sources[action.language] = action.source;
      Storage.save(project);
      ProjectStore.emitChange();
      break;

    case ProjectConstants.PROJECT_CREATED:
      var project = action.project;
      project.projectKey = generateProjectKey();
      _projects[project.projectKey] = project;
      Storage.save(project);
      ProjectStore.emitChange();
      break;

    case ProjectConstants.PROJECT_LOADED_FROM_STORAGE:
      _projects[action.project.projectKey] = action.project;
      ProjectStore.emitChange();
      break;

    case ProjectConstants.PROJECT_LIBRARY_TOGGLED:
      var project = ProjectStore.get(action.projectKey);
      var libraries = project.enabledLibraries;
      var libraryKey = action.libraryKey;
      if (libraries.indexOf(libraryKey) === -1) {
        libraries.push(libraryKey);
      } else {
        _.pull(libraries, libraryKey);
      }
      Storage.save(action.projectKey, project);
      ProjectStore.emitChange();
      break;
  }
});

module.exports = ProjectStore;
