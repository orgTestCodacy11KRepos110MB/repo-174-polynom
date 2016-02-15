import { connect } from "react-redux"
import { pathsActions, pointsActions } from "../../src/actions"
import Point from "./Point"

const mapStateToProps = (state) => state

const mapDispatchToProps = (dispatch, ownProps) => ({
  onPointAddActive() {
    dispatch(pathsActions.setActivePaths([ownProps.path.id], true))
    dispatch(pointsActions.setActivePoints([ownProps.point.id], true))
  },
  onPointActive() {
    dispatch(pathsActions.deactivatePaths())
    dispatch(pointsActions.deactivatePoints())
    dispatch(pathsActions.setActivePaths([ownProps.path.id], true))
    dispatch(pointsActions.setActivePoints([ownProps.point.id], true))
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Point)
