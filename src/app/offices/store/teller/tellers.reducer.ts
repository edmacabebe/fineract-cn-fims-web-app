/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {ResourceState} from '../../../common/store/resource.reducer';
import * as tellers from '../teller/teller.actions';
import {Status, Teller} from '../../../services/teller/domain/teller.model';
import {idsToHashWithCurrentTimestamp, resourcesToHash} from '../../../common/store/reducer.helper';
import {TellerManagementCommand} from '../../../services/teller/domain/teller-management-command.model';

export const initialState: ResourceState = {
  ids: [],
  entities: {},
  loadedAt: {},
  selectedId: null,
};

export function reducer(state = initialState, action: tellers.Actions): ResourceState {

  switch (action.type) {

    case tellers.LOAD_TELLER: {
      return initialState;
    }

    case tellers.LOAD_TELLER_SUCCESS: {
      const tellers: Teller[] = action.payload;

      const ids = tellers.map(teller => teller.code);

      const entities = resourcesToHash(tellers, 'code');

      const loadedAt = idsToHashWithCurrentTimestamp(ids);

      return {
        ids: [ ...ids ],
        entities: entities,
        loadedAt: loadedAt,
        selectedId: state.selectedId
      };
    }

    case tellers.EXECUTE_COMMAND_SUCCESS: {
      const payload = action.payload;
      const tellerCode = payload.tellerCode;
      const command: TellerManagementCommand = payload.command;
      const teller: Teller = state.entities[tellerCode];

      let tellerState: Status = null;
      let assignedEmployee = null;

      if (command.action === 'OPEN') {
        tellerState = 'OPEN';
        assignedEmployee = command.assignedEmployeeIdentifier;
      } else if (command.action === 'CLOSE') {
        tellerState = 'CLOSED';
      }

      const newTeller = Object.assign({}, teller, {
        state: tellerState,
        assignedEmployee
      });

      return {
        ids: [ ...state.ids ],
        entities: Object.assign({}, state.entities, {
          [teller.code]: newTeller
        }),
        loadedAt: state.loadedAt,
        selectedId: state.selectedId
      };
    }

    default: {
      return state;
    }
  }
}
