/* eslint-env mocha */

import '../../helper';
import {assert} from 'chai';

import createApplicationStore from '../../../src/createApplicationStore';

import {
  createProject,
  changeCurrentProject,
} from '../../../src/actions/projects';

import {toggleLibrary} from '../../../src/actions';

import {
  getProjectKeys,
  getCurrentProject,
  isPristineProject,
} from '../../../src/util/projectUtils';

describe('projectActions', () => {
  let store;

  beforeEach(() => {
    store = createApplicationStore();
  });

  describe('createProject', () => {
    it('creates a new project', () => {
      const previousKeys = getProjectKeys(store.getState());
      store.dispatch(createProject());
      assert.notInclude(
        previousKeys,
        getCurrentProject(store.getState()).projectKey
      );
    });

    it('creates a project that is pristine', () => {
      store.dispatch(createProject());
      assert(
        isPristineProject(getCurrentProject(store.getState())),
        'project should be pristine'
      );
    });
  });

  describe('changeCurrentProject', () => {
    let projectKey;

    beforeEach(() => {
      projectKey = createAndMutateProject();
      createAndMutateProject();
      store.dispatch(changeCurrentProject(projectKey));
    });

    it('changes to the specified project', () => {
      assert.equal(projectKey, getCurrentProject(store.getState()).projectKey);
    });

    it('keeps all projects in list', () => {
      assert.lengthOf(getProjectKeys(store.getState()), 2);
    });
  });

  function createAndMutateProject() {
    store.dispatch(createProject());
    const projectKey = getCurrentProject(store.getState()).projectKey;
    store.dispatch(toggleLibrary(projectKey, 'jquery'));
    return projectKey;
  }
});
