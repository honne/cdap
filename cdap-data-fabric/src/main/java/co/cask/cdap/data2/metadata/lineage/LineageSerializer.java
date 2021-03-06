/*
 * Copyright © 2015 Cask Data, Inc.
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

package co.cask.cdap.data2.metadata.lineage;

import co.cask.cdap.proto.Id;
import co.cask.cdap.proto.metadata.lineage.CollapseType;
import co.cask.cdap.proto.metadata.lineage.DataRecord;
import co.cask.cdap.proto.metadata.lineage.LineageRecord;
import co.cask.cdap.proto.metadata.lineage.ProgramRecord;
import co.cask.cdap.proto.metadata.lineage.RelationRecord;
import com.google.common.base.Function;
import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Sets;
import org.apache.twill.api.RunId;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Serializes {@link Lineage} into a {@link LineageRecord}.
 */
// TODO: Clean up this class (make data/program keys) when new Id classes are used CDAP-4291
public final class LineageSerializer {
  private static final Function<Id.NamespacedId, String> ID_STRING_FUNCTION =
    new Function<Id.NamespacedId, String>() {
      @Override
      public String apply(Id.NamespacedId input) {
        return input.getId();
      }
    };

  private static final Function<RunId, String> RUN_ID_STRING_FUNCTION =
    new Function<RunId, String>() {
      @Override
      public String apply(RunId input) {
        return input.getId();
      }
    };

  private static final Function<AccessType, String> ACCESS_TYPE_STRING_FUNCTION =
    new Function<AccessType, String>() {
      @Override
      public String apply(AccessType input) {
        return input.toString().toLowerCase();
      }
    };

  private LineageSerializer() {}

  public static LineageRecord toLineageRecord(long start, long end, Lineage lineage, Set<CollapseType> collapseTypes) {
    Set<RelationRecord> relationBuilder = new HashSet<>();
    Map<String, ProgramRecord> programBuilder = new HashMap<>();
    Map<String, DataRecord> dataBuilder = new HashMap<>();

    Set<CollapsedRelation> collapsedRelations =
      LineageCollapser.collapseRelations(lineage.getRelations(), collapseTypes);
    for (CollapsedRelation relation : collapsedRelations) {
      String dataKey = makeDataKey(relation.getData());
      String programKey = makeProgramKey(relation.getProgram());
      RelationRecord relationRecord = new RelationRecord(dataKey, programKey,
                                                         convertAccessType(relation.getAccess()),
                                                         convertRuns(relation.getRuns()),
                                                         convertComponents(relation.getComponents()));
      relationBuilder.add(relationRecord);
      programBuilder.put(programKey, new ProgramRecord(relation.getProgram()));
      dataBuilder.put(dataKey, new DataRecord(relation.getData()));
    }
    return new LineageRecord(start, end, relationBuilder, programBuilder, dataBuilder);
  }

  private static Set<String> convertAccessType(Set<AccessType> accessTypes) {
    return ImmutableSet.copyOf(Iterables.transform(accessTypes, ACCESS_TYPE_STRING_FUNCTION));
  }

  private static Set<String> convertRuns(Set<RunId> runIds) {
    return ImmutableSet.copyOf((Iterables.transform(runIds, RUN_ID_STRING_FUNCTION)));
  }

  private static Set<String> convertComponents(Set<Id.NamespacedId> components) {
    return Sets.newHashSet(Iterables.transform(components, ID_STRING_FUNCTION));
  }

  private static String makeProgramKey(Id.Program program) {
    return Joiner.on('.').join(program.getType().getCategoryName().toLowerCase(), program.getNamespaceId(),
                               program.getApplicationId(), program.getId());
  }

  private static String makeDataKey(Id.NamespacedId data) {
    if (data instanceof Id.DatasetInstance) {
      return makeDatasetKey((Id.DatasetInstance) data);
    }

    if (data instanceof  Id.Stream) {
      return makeStreamKey((Id.Stream) data);
    }

    throw new IllegalArgumentException("Unknown data object " + data);
  }

  private static String makeDatasetKey(Id.DatasetInstance datasetInstance) {
    return Joiner.on('.').join("dataset", datasetInstance.getNamespaceId(), datasetInstance.getId());
  }

  private static String makeStreamKey(Id.Stream stream) {
    return Joiner.on('.').join("stream", stream.getNamespaceId(), stream.getId());
  }
}
