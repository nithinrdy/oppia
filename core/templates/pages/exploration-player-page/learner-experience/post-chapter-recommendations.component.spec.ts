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
 * @fileoverview Unit tests for the post chapter recommendations component.
 */

import { ComponentFixture, waitForAsync, TestBed } from '@angular/core/testing';
import { PostChapterRecommendationsComponent } from './post-chapter-recommendations.component';

describe('End chapter check mark component', function() {
  let component: PostChapterRecommendationsComponent;
  let fixture: ComponentFixture<PostChapterRecommendationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PostChapterRecommendationsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostChapterRecommendationsComponent);
    component = fixture.componentInstance;
  });
});
