// Copyright 2022 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview End-to-end tests for the checkpoint features.
 */

var forms = require('../webdriverio_utils/forms.js');
var general = require('../webdriverio_utils/general.js');
var users = require('../webdriverio_utils/users.js');
var workflow = require('../webdriverio_utils/workflow.js');

var AdminPage = require('../webdriverio_utils/AdminPage.js');
var Constants = require('../webdriverio_utils/WebdriverioConstants.js');
var TopicsAndSkillsDashboardPage =
  require('../webdriverio_utils/TopicsAndSkillsDashboardPage.js');
var TopicAndStoryViewerPage = require(
  '../webdriverio_utils/TopicAndStoryViewerPage.js');
var TopicEditorPage = require('../webdriverio_utils/TopicEditorPage.js');
var StoryEditorPage = require('../webdriverio_utils/StoryEditorPage.js');
var ExplorationEditorPage =
  require('../webdriverio_utils/ExplorationEditorPage.js');
var ExplorationPlayerPage =
  require('../webdriverio_utils/ExplorationPlayerPage.js');
var SkillEditorPage = require('../webdriverio_utils/SkillEditorPage.js');

describe('Topic and Story viewer functionality', function() {
  var adminPage = null;
  var topicAndStoryViewerPage = null;
  var topicsAndSkillsDashboardPage = null;
  var topicEditorPage = null;
  var storyEditorPage = null;
  var explorationPlayerPage = null;
  var dummyExplorationIds = [];
  var skillEditorPage = null;

  var createDummyExplorations = async function() {
    var EXPLORATION = {
      category: 'English',
      objective: 'The goal is to check story viewer functionality.',
      language: 'English'
    };

    for (var i = 1; i <= 3; i++) {
      await workflow.createAndPublishExplorationWithAdditionalCheckpoint(
        `Exploration TASV1 - ${i}`,
        EXPLORATION.category,
        EXPLORATION.objective,
        EXPLORATION.language,
        i === 1,
        true
      );
      dummyExplorationIds.push(await general.getExplorationIdFromEditor());
    }
  };

  beforeAll(async function() {
    adminPage = new AdminPage.AdminPage();
    explorationPlayerPage = new ExplorationPlayerPage.ExplorationPlayerPage();
    explorationEditorPage = new ExplorationEditorPage.ExplorationEditorPage();
    explorationEditorMainTab = explorationEditorPage.getMainTab();
    topicAndStoryViewerPage = (
      new TopicAndStoryViewerPage.TopicAndStoryViewerPage());
    topicsAndSkillsDashboardPage = (
      new TopicsAndSkillsDashboardPage.TopicsAndSkillsDashboardPage());
    topicEditorPage = new TopicEditorPage.TopicEditorPage();
    skillEditorPage = new SkillEditorPage.SkillEditorPage();
    storyEditorPage = new StoryEditorPage.StoryEditorPage();
    await users.createAndLoginCurriculumAdminUser(
      'creator@storyViewer.com', 'creatorStoryViewer');

    // The below lines of code enable the user checkpoints feature on the
    // config tab. This is required to enable the lesson-info modal button
    // on the exploration footer, which in turn is required to view the
    // checkpoint message.
    // This should be removed when the user checkpoints feature is no longer
    // gated behind a config option.
    await adminPage.editConfigProperty(
      'Enable checkpoints feature.', 'Boolean',
      async(elem) => await (await elem).setValue(true));

    // The below lines enable the checkpoint_celebration flag in prod mode.
    // They should be removed after the checkpoint_celebration flag is
    // deprecated.
    await adminPage.getFeaturesTab();
    var endChapterFlag = (
      await adminPage.getCheckpointCelebrationFeatureElement());
    await adminPage.enableFeatureForProd(endChapterFlag);

    await createDummyExplorations();
    var handle = await browser.getWindowHandle();
    await topicsAndSkillsDashboardPage.get();
    await topicsAndSkillsDashboardPage.createTopic(
      'Topic TASV1', 'topic-tasv-one', 'Description', false);
    await topicEditorPage.submitTopicThumbnail(Constants.TEST_SVG_PATH, true);
    await topicEditorPage.updateMetaTagContent('topic meta tag');
    await topicEditorPage.updatePageTitleFragment('topic page title');
    await topicEditorPage.saveTopic('Added thumbnail.');
    var url = await browser.getUrl();
    var topicId = url.split('/')[4].slice(0, -1);
    await general.closeCurrentTabAndSwitchTo(handle);
    await adminPage.editConfigProperty(
      'The details for each classroom page.',
      'List',
      async function(elem) {
        elem = await elem.editItem(0, 'Dictionary');
        elem = await elem.editEntry(4, 'List');
        elem = await elem.addItem('Unicode');
        await elem.setValue(topicId);
      });

    await topicsAndSkillsDashboardPage.get();
    await topicsAndSkillsDashboardPage.createSkillWithDescriptionAndExplanation(
      'Skill TASV1', 'Concept card explanation', false);
    await skillEditorPage.addRubricExplanationForDifficulty(
      'Easy', 'Second explanation for easy difficulty.');
    await skillEditorPage.saveOrPublishSkill('Edited rubrics');

    await general.closeCurrentTabAndSwitchTo(handle);
    await topicsAndSkillsDashboardPage.get();
    await topicsAndSkillsDashboardPage.navigateToSkillsTab();
    await topicsAndSkillsDashboardPage.assignSkillToTopic(
      'Skill TASV1', 'Topic TASV1');
    await topicsAndSkillsDashboardPage.get();
    await topicsAndSkillsDashboardPage.editTopic('Topic TASV1');
    await topicEditorPage.addSubtopic(
      'Subtopic TASV1', 'subtopic-tasv-one', Constants.TEST_SVG_PATH,
      'Subtopic content');
    await topicEditorPage.addConceptCardToSubtopicExplanation('Skill TASV1');
    await topicEditorPage.saveSubtopicExplanation();
    await topicEditorPage.saveTopic('Added subtopic.');
    await topicEditorPage.navigateToTopicEditorTab();
    await topicEditorPage.navigateToReassignModal();
    await topicEditorPage.dragSkillToSubtopic('Skill TASV1', 0);
    await topicEditorPage.saveRearrangedSkills();
    await topicEditorPage.saveTopic('Added skill to subtopic.');
    await topicEditorPage.publishTopic();
    await topicsAndSkillsDashboardPage.editTopic('Topic TASV1');
    await topicEditorPage.createStory(
      'Story TASV1', 'storyplayertasvone', 'Story description',
      Constants.TEST_SVG_PATH);
    await storyEditorPage.updateMetaTagContent('story meta tag');
    for (var i = 0; i < 3; i++) {
      await storyEditorPage.createNewChapter(
        `Chapter ${i}`, dummyExplorationIds[i], Constants.TEST_SVG_PATH);
      await storyEditorPage.navigateToChapterWithName(`Chapter ${i}`);
      await storyEditorPage.changeNodeDescription('Chapter description');
      await storyEditorPage.changeNodeOutline(
        await forms.toRichText(`outline ${i}`));
      await storyEditorPage.navigateToStoryEditorTab();
    }
    await storyEditorPage.saveStory('First save');
    await storyEditorPage.publishStory();
    await users.logout();
  });

  it('should encounter checkpoint progress modal upon completing a checkpoint',
    async function() {
      await topicAndStoryViewerPage.get(
        'math', 'topic-tasv-one', 'storyplayertasvone');
      await topicAndStoryViewerPage.expectCompletedLessonCountToBe(0);
      await topicAndStoryViewerPage.expectUncompletedLessonCountToBe(3);
      await topicAndStoryViewerPage.goToChapterIndex(0);
      await explorationPlayerPage.submitAnswer('Continue', null);

      await explorationPlayerPage
        .expectCongratulatoryCheckpointMessageToAppear();
      await explorationPlayerPage
        .expectCheckpointProgressMessageToBeDisplayedOnLessonInfoModal();
      await explorationPlayerPage
        .expectCongratulatoryCheckpointMessageToDisappear();
    });

  afterEach(async function() {
    await general.checkForConsoleErrors([]);
  });
});
