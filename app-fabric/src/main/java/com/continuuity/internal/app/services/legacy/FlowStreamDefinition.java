/*
 * Copyright 2012-2014 Continuuity, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

package com.continuuity.internal.app.services.legacy;

import java.net.URI;

/**
 * FlowInputDefinition provides the stream parameters of the flow. These
 * are external streams, that is they are not written (or not read) by
 * the flowlets within this flow, but by some other entity outside this
 * flow, such as the gateway or another flow.
 *
 * A flow stream has a name, by which is referenced within the flow, and a
 * URI, which is used to address the stream in the data fabric. The name
 * must be unique within the flow's streams, whereas the URI must be unique
 * across flows.
 */
public interface FlowStreamDefinition {
  /**
   * Returns the name of the stream
   * @return name of the stream.
   */
  public String getName();

  /**
   * Returns the URI of the stream.
   * @return the URI of the stream.
   */
  public URI getURI();
}
