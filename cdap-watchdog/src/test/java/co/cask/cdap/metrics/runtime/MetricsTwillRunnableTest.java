/*
 * Copyright © 2016 Cask Data, Inc.
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

package co.cask.cdap.metrics.runtime;

import co.cask.cdap.common.conf.CConfiguration;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.junit.Test;

/**
 * Test {@link MetricsTwillRunnable} and {@link MetricsProcessorTwillRunnable}.
 */
public class MetricsTwillRunnableTest {

  @Test
  public void testMetricsTwillRunnableInjector() throws Exception {
    MetricsTwillRunnable.createGuiceInjector(CConfiguration.create(), HBaseConfiguration.create());
  }

  @Test
  public void testMetricsProcessorTwillRunnableInjector() {
    MetricsProcessorTwillRunnable.createGuiceInjector(CConfiguration.create(), new Configuration());
  }
}
