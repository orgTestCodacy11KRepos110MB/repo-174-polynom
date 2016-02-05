import * as ActionTypes from "../constants/ActionTypes"

export function deactivatePoints() {
  return {
    type: ActionTypes.DEACTIVATE_POINTS,
  }
}

export function setActivePoint(pointId, isActive) {
  return {
    type: ActionTypes.SET_ACTIVE_POINT,
    pointId,
    isActive,
  }
}

let newPointId = 0
export function createPoint(pathId, code, x, y, parameters) {
  return (dispatch, getState) => {
    const { pathsById, pointsById } = getState()

    // determine the position of the point in the corresponding path
    const insertAt = pathsById[pathId].points.reduce((acc, key, index) => {
      return pointsById[key].isActive ? index + 1 : acc
    }, 0)

    newPointId++

    dispatch(deactivatePoints())
    dispatch(addPoint(pathId, newPointId, insertAt, code, x, y, parameters))
    dispatch(setActivePoint(newPointId, true))
  }
}

function addPoint(pathId, pointId, insertAt, code, x, y, parameters) {
  return {
    type: ActionTypes.ADD_POINT,
    pathId,
    pointId,
    insertAt,
    code,
    x,
    y,
    parameters,
  }
}

export function removePoint(pathId, pointId) {
  return {
    type: ActionTypes.REMOVE_POINT,
    pathId,
    pointId,
  }
}

export function setPointCode(pointId, code, parameters) {
  return {
    type: ActionTypes.SET_POINT_CODE,
    pointId,
    code,
    parameters,
  }
}

export function setPointX(pointId, x) {
  return {
    type: ActionTypes.SET_POINT_X,
    pointId,
    x,
  }
}

export function setPointY(pointId, y) {
  return {
    type: ActionTypes.SET_POINT_Y,
    pointId,
    y,
  }
}

export function setPointParameters(pointId, parameters) {
  return {
    type: ActionTypes.SET_POINT_PARAMETERS,
    pointId,
    parameters,
  }
}
