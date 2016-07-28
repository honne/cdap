.. meta::
    :author: Cask Data, Inc.
    :copyright: Copyright © 2016 Cask Data, Inc.

.. _cask-hydrator-studio:

===============
Hydrator Studio
===============

Hydrator supports end-users with self-service batch and real-time data ingestion combined
with ETL (extract-transform-load), expressly designed for the building of Hadoop data
lakes and data pipelines. Called *Cask Hydrator Studio*, it provides for CDAP users a
seamless and easy method to configure and operate pipelines from different types of
sources and data using a visual editor.

You drag and drop sources, transformations, sinks, and other plugins to configure a pipeline:

.. figure:: _images/hydrator-studio.png
   :figwidth: 100%
   :width: 6in
   :align: center
   :class: bordered-image-top-margin

   **Cask Hydrator Studio:** Visual editor showing the creation of an ETL pipeline

Once completed, Hydrator provides an operational view of the resulting pipeline that allows for
monitoring of metrics, logs, and other runtime information:

.. figure:: _images/hydrator-pipelines.png
   :figwidth: 100%
   :width: 6in
   :align: center
   :class: bordered-image

   **Cask Hydrator Pipelines:** Administration of created pipelines showing their current status

Hydrator Studio Tips
====================

- After clicking on a node, a dialog comes up to allow for **configuring of the node**. As any
  changes are automatically saved, you can just close the dialog by either hitting the close
  button (an *X* in the upper-right corner), the *escape* key on your keyboard, or clicking
  outside the dialog box.
  
- To **edit a connection** made from one node to another node, you can remove the
  connection by clicking the end with the arrow symbol (click on the white dot) and dragging
  it off of the target node.

- All **pipelines must have unique names**, and a pipeline **cannot be saved over an existing
  pipeline** of the same name. Instead, increment the name (from *Demo* to *Demo-1*) with
  each new cloning of a pipeline.

Plugin Templates
================
Within Hydrator Studio, you can create *plugin templates:* customized versions of a plugin
that are reusable, and can contain pre-configured settings.

Setting can be locked so that they cannot be altered when they are eventually used.

Once a plugin template has been created, it can be edited and deleted at a later time.

Changes to a plugin template do not affect any pipelines created using that template, as
those pipelines are created from the artifacts as specified in the plugin template at the
time of creation of the pipeline.
