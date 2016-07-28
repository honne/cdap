.. meta::
    :author: Cask Data, Inc.
    :copyright: Copyright © 2016 Cask Data, Inc.

.. _cask-hydrator-running-pipelines:

=================
Running Pipelines
=================


Pipeline can be started, stopped, and controlled using:

- :ref:`Cask Hydrator UI <cask-hydrator-running-pipelines-within-hydrator>`
- :ref:`CDAP UI <cdap-ui>`
- :ref:`CDAP CLI <cdap-cli>`
- Command line tools, using the :ref:`Lifecycle HTTP RESTful API <http-restful-api-lifecycle-start>`


.. _cask-hydrator-running-pipelines-within-hydrator:

Running a Pipeline within Hydrator
==================================
From within Hydrator, you can start and stop pipelines. 

For a batch pipeline, you can start or stop ("suspend") its schedule. It will then begin
at the next scheduled time. (To change the schedule requires creating a new pipeline with
a new schedule.)

For a real-time pipeline, you simply start or stop the pipeline.

You can view details of a pipeline, such as its configuration, settings, stages, schemas, etc.


Runtime Arguments
=================
You may want to create a pipeline that has several configuration settings that are not
known at pipeline creation time, but that are set at the start of the each pipeline run.

For instance, you might want a pipeline that reads from a database (a source) and writes
to a table (a sink). The name of the database source and name of the table sink might
change from run to run and you need to specify those values as input before starting a
run.

You might want to create a pipeline with a particular action at the start of the run.
The action could, based on some logic, provide the name of the database to use as a source
and the name of the table to write as a sink. The next stage in the pipeline might use
this information to read and write from appropriate sources and sinks.

To do this, Hydrator supports the use of macros that will, at runtime, will be evaluated
and substituted for. The macros support recursive (nested) expansion and use a simple
syntax. These macros are defined in the pipeline configuration and in the runtime arguments.

Runtime arguments are resolved by sourcing them from the application preferences, the
runtime arguments, and the workflow token. Precedence is with the workflow token having
the highest precedence.

These arguments and preferences can be set with the CDAP UI, the CDAP CLI or the 
:ref:`Program Lifecycle <http-restful-api-program-lifecycle>` and :ref:`Preferences
<http-restful-api-preferences>` HTTP RESTful APIs.

Details of usage and examples are explained in the section on :ref:`runtime arguments and
macros <cask-hydrator-runtime-arguments-macros>`.


Re-running a Pipeline
=====================



Notifications
=============
When a pipeline is completed, notifications can be sent by using one or more *post-run
actions*.

The :ref:`post-run plugins <cask-hydrator-plugins-post-run-plugins>` allow for emails,
database queries, and a general HTTP callback action.


Logs
====
As pipelines run, they create entries in the CDAP logs.

Logs for a pipeline can be obtained using the same tools as any other CDAP application and
program, and are described in the :ref:`Administration manual, Logging and Monitoring
<logging-monitoring>` and the :ref:`Logging HTTP RESTful API <http-restful-api-logging>`.

Script transform steps can write to logs, as described in the section in developing
plugins on :ref:`script transformations
<cask-hydrator-creating-a-plugin-script-transformations>`.


Metrics
=======
As pipelines run, they create both system and user metrics.

System metrics for a pipeline can be obtained using the same tools as any other CDAP
application and program, and are described in the :ref:`Administration manual, metrics
<operations-metrics>` and the :ref:`Metrics HTTP RESTful API <http-restful-api-metrics>`.

Script transform steps can create metrics, as described in the section in developing
plugins on :ref:`script transformations
<cask-hydrator-creating-a-plugin-script-transformations>`.

For instance, if you have a real-time pipeline named "demoPipeline" with three stages
(*DataGenerator*, *JavaScript*, and *Table*), then you can discover the available metrics
using a `curl` command, such as (reformatted for display):

  .. tabbed-parsed-literal::

    $ curl -w"\n" -X POST "http://localhost:10000/v3/metrics/search?target=metric&tag=namespace:default&tag=app:demoPipeline"

    ["system.app.log.debug","system.app.log.info","system.app.log.warn","system.dataset.
    store.bytes","system.dataset.store.ops","system.dataset.store.reads","system.dataset.
    store.writes","system.metrics.emitted.count","user.DataGenerator.records.out","user.
    JavaScript.record.count","user.JavaScript.records.in","user.JavaScript.records.out","
    user.Table.records.in","user.Table.records.out","user.metrics.emitted.count"]
  
In this case, the user metric *"user.JavaScript.record.count"* was incremented in the JavaScript stage using::

  context.getMetrics().count('record.count', 1);
  
The value of the metric can be retrieved with:

  .. tabbed-parsed-literal::

    $ curl -w"\n" -X POST "localhost:10000/v3/metrics/query?tag=namespace:default&tag=app:etlRealtime6&metric=user.JavaScript.record.count&aggregate=true"

    {"startTime":0,"endTime":1468884338,"series":[{"metricName":"user.JavaScript.record.
    count","grouping":{},"data":[{"time":0,"value":170}]}],"resolution":"2147483647s"}

Using the CDAP CLI, you can retrieve the value with:

  .. tabbed-parsed-literal::
    :tabs: "CDAP CLI"
 
    |cdap >| get metric value user.JavaScript.record.count 'app=demoPipeline'
 
    Start time: 0
    End time: 1468884640
 
    Series: user.JavaScript.record.count
    +===================+
    | timestamp | value |
    +===================+
    | 0         | 170   |
    +===================+


Error Record Handling
=====================
To Be Completed


Configuring Resources
=====================
*To Be Completed*
