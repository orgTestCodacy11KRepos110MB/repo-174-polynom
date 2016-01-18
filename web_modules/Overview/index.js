import React, { Component, PropTypes } from "react"
import { findDOMNode } from "react-dom"
import { connect } from "react-redux"
import Grid from "Grid"
import Shape from "Shape"
import "./styles"
import * as pointsActions from "../../src/actions/points"
import { activePathSelector } from "../../src/selectors/paths"

const mapStateToProps = (state) => {
  return {
    builder: state.builder,
    points: state.points,
    ...activePathSelector(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onOverviewClick: (pathId, code, x, y, parameters) =>
      dispatch(pointsActions.createPoint(pathId, code, x, y, parameters)),
    onPointClick: (pathId, pointId) =>
      dispatch(pointsActions.activatePoint(pathId, pointId)),
    onXPositionChange: (pointId, x) =>
      dispatch(pointsActions.setPointX(pointId, x)),
    onYPositionChange: (pointId, y) =>
      dispatch(pointsActions.setPointY(pointId, y)),
    onParametersChange: (pointId, parameters) =>
      dispatch(pointsActions.setPointParameters(pointId, parameters)),
  }
}

class Overview extends Component {
  state = {
    isDragging: false,
    draggedPoint: null,
    x: null,
    y: null,
  };

  componentDidMount() {
    document.addEventListener("mousemove", this.handleMouseMove)
    document.addEventListener("mouseup", this.handleMouseUp)
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleMouseMove)
    document.removeEventListener("mouseup", this.handleMouseUp)
  }

  getCoords = (e) => {
    const { builder } = this.props
    const { left, top } = findDOMNode(this).getBoundingClientRect()

    let x = Math.round(e.clientX - left)
    let y = Math.round(e.clientY - top)

    // grid snaping
    if (builder.grid.snapToGrid) {
      x = builder.grid.size * Math.round(x / builder.grid.size)
      y = builder.grid.size * Math.round(y / builder.grid.size)
    }

    return { x, y }
  };

  handlePointMouseDown = (key) => {
    this.setState({
      isDragging: true,
      draggedPoint: key,
      x: this.props.points[key].x,
      y: this.props.points[key].y,
    })
  };

  handleMouseUp = (e) => {
    if (this.state.isDragging) {
      const { draggedPoint, x, y } = this.state

      this.props.onXPositionChange(this.state.draggedPoint, x)
      this.props.onYPositionChange(this.state.draggedPoint, y)

      this.setState({
        isDragging: false,
        draggedPoint: null,
        x: null,
        y: null,
      })
    }
  };

  handleMouseMove = (e) => {
    if (this.state.isDragging) {
      e.preventDefault()

      const { x, y } = this.getCoords(e)
      this.setState({ x, y })
    }
  };

  handleOverviewClick = (e) => {
    const { activePath } = this.props
    const { x, y } = this.getCoords(e)

    this.props.onOverviewClick(activePath.id, "L", x, y, {})
  };

  reducePoints = (path) => {
    const { isDragging, draggedPoint, x, y } = this.state
    const pathPoints = path.points.reduce((acc, key) => {
      return { ...acc, [key]: this.props.points[key] }
    }, {})

    if (isDragging && path.points.indexOf(draggedPoint) > -1) {
      pathPoints[draggedPoint].x = x
      pathPoints[draggedPoint].y = y
    }

    return pathPoints
  };

  renderShape = (key, index, paths) => {
    const path = this.props.pathsById[key]

    return (
      <Shape
        key={ key }
        path={ path }
        points={ this.reducePoints(path) }
        onPointClick={ (pointId) => this.props.onPointClick(path.id, pointId) }
        onPointMouseDown={ this.handlePointMouseDown } />
    )
  };

  render() {
    const { builder, paths } = this.props

    return (
      <svg
        className="ad-Overview"
        style={ {
          width: builder.width,
          height: builder.height,
        } }
        onDoubleClick={ this.handleOverviewClick }>
        <Grid
          width={ builder.width }
          height={ builder.height }
          grid={ builder.grid } />

        { paths.map(this.renderShape) }
      </svg>
    )
  }
}

Overview.propTypes = {
  onOverviewClick: PropTypes.func.isRequired,
  onPointClick: PropTypes.func.isRequired,
  onXPositionChange: PropTypes.func.isRequired,
  onYPositionChange: PropTypes.func.isRequired,
  onParametersChange: PropTypes.func.isRequired,
  builder: PropTypes.object.isRequired,
  points: PropTypes.object.isRequired,
  paths: PropTypes.array.isRequired,
  pathsById: PropTypes.object.isRequired,
  activePath: PropTypes.object.isRequired,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview)
