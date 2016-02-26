import React, { Component, PropTypes } from "react"
import { findDOMNode } from "react-dom"
import { DragSource, DropTarget } from "react-dnd"
import { getEmptyImage } from "react-dnd-html5-backend"
import cx from "classnames"
import Expand from "Expand"
import ExpandCaption from "Expand/ExpandCaption"
import ExpandPanel from "Expand/ExpandPanel"
import Settings from "Settings"
import Setting from "Settings/Setting"
import Checkbox from "Checkbox"
import Text from "Text"
import Textarea from "Text/Textarea"
import Icon from "Icon"
import { SIDEBAR_PATH } from "../../src/constants/ObjectTypes"
import { APP_CTRL, APP_SHIFT } from "../../src/constants/KeyActionTypes"
import { pathCode } from "../../src/utils"
import "./styles"

class SidebarPath extends Component {
  state = {
    isFocused: false,
    d: null,
  };

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true,
    })
  }

  handlePathClick = () => {
    const {
      keyActions,
      project,
      path,
      activePaths,
      activePoints,
      pathsById,
    } = this.props

    if (!keyActions.includes(APP_CTRL)) {
      this.props.onDeactivate(activePaths, activePoints)
    }

    if (keyActions.includes(APP_SHIFT)) {
      const pathIndex = project.paths.indexOf(path.id)
      const activePathIndex = project.paths.indexOf(activePaths[0])
      const pathIds = pathIndex < activePathIndex ?
        project.paths.slice(pathIndex, activePathIndex + 1) :
        project.paths.slice(activePathIndex, pathIndex + 1)

      const pointIds = pathIds.reduce((acc, key) => [
        ...acc,
        ...pathsById[key].points,
      ], [])

      this.props.onActivate(pathIds, pointIds)
    } else {
      this.props.onActivate([path.id], path.points)
    }
  };

  handleNameChange = (e) => {
    const value = e.target.value

    if (value.trim() !== "") {
      this.props.onNameChange(value)
    }
  };

  handleChange = (e) => {
    this.setState({ d: e.target.value })
  };

  handleFocus = (e) => {
    this.d = e.target.value

    this.setState({
      isFocused: true,
      d: this.d,
    })
  };

  handleBlur = (e) => {
    this.setState({ isFocused: false })

    if (this.d !== e.target.value) {
      this.props.onPathCodeChange(e.target.value)
    }
  };

  handleRelativeChange = (e) => {
    this.props.onRelativeChange(e.target.checked)
  };

  handleClosedChange = (e) => {
    this.props.onClosedChange(e.target.checked)
  };

  handleFilledChange = (e) => {
    this.props.onFilledChange(e.target.checked)
  };

  render() {
    const {
      path,
      pointsById,
      connectDragSource,
      connectDropTarget,
      isDragging,
      isOver,
    } = this.props

    return connectDropTarget(
      <div
        className={ cx("ad-SidebarPath", { "is-active": path.isActive }) }
        style={ {
          opacity: isDragging ? 0 : 1,
          border: isOver && "2px solid red",
        } }>
        <Expand>
          <ExpandCaption onClick={ this.handlePathClick }>
            <div className="ad-SidebarPathCaption">
              <div className="ad-SidebarPath-name">
                <Text
                  className="ad-SidebarPath-input"
                  value={ path.name }
                  onChange={ this.handleNameChange } />
              </div>

              <div className="ad-SidebarPath-actions">
                { connectDragSource(
                  <div className="ad-SidebarPath-reorder">
                    <Icon name="reorder" />
                  </div>
                ) }
              </div>
            </div>
          </ExpandCaption>

          <ExpandPanel>
            <Settings>
              <Setting>
                <Textarea
                  value={ this.state.isFocused ?
                    this.state.d :
                    pathCode(path, pointsById) }
                  onChange={ this.handleChange }
                  onFocus={ this.handleFocus }
                  onBlur={ this.handleBlur } />
              </Setting>
            </Settings>

            <Settings>
              <Setting label="Relative">
                <Checkbox
                  checked={ path.isRelative }
                  onChange={ this.handleRelativeChange } />
              </Setting>

              <Setting label="Closed">
                <Checkbox
                  checked={ path.isClosed }
                  onChange={ this.handleClosedChange } />
              </Setting>

              <Setting label="Filled">
                <Checkbox
                  checked={ path.isFilled }
                  onChange={ this.handleFilledChange } />
              </Setting>
            </Settings>
          </ExpandPanel>
        </Expand>
      </div>
    )
  }
}

SidebarPath.propTypes = {
  onActivate: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  onPathMove: PropTypes.func.isRequired,
  onNameChange: PropTypes.func.isRequired,
  onPathCodeChange: PropTypes.func.isRequired,
  onRelativeChange: PropTypes.func.isRequired,
  onClosedChange: PropTypes.func.isRequired,
  onFilledChange: PropTypes.func.isRequired,
  keyActions: PropTypes.array.isRequired,
  project: PropTypes.object.isRequired,
  path: PropTypes.object.isRequired,
  activePaths: PropTypes.array.isRequired,
  activePoints: PropTypes.array.isRequired,
  pathsById: PropTypes.object.isRequired,
  pointsById: PropTypes.object.isRequired,
}

const sidebarPathTarget = {
  drop(props, monitor, component) {
    const { project, path } = monitor.getItem()
    const index = project.paths.indexOf(path.id)
    const hoveredIndex = props.project.paths.indexOf(props.path.id)

    if (index === hoveredIndex) {
      return
    }

    const { bottom, top } = findDOMNode(component).getBoundingClientRect()
    const { y } = monitor.getClientOffset()
    const middle = (bottom - top) / 2
    const position = y - top

    if (index < hoveredIndex && position < middle) {
      return props.onPathMove(project.id, hoveredIndex - 1, path.id)
    }

    if (index > hoveredIndex && position > middle) {
      return props.onPathMove(project.id, hoveredIndex + 1, path.id)
    }

    return props.onPathMove(project.id, hoveredIndex, path.id)
  },
}

const sidebarPathSource = {
  beginDrag(props, monitor, component) {
    return {
      project: props.project,
      path: props.path,
      boundingRect: findDOMNode(component).getBoundingClientRect(),
    }
  },
}

export default DropTarget(
  SIDEBAR_PATH,
  sidebarPathTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  })
)(DragSource(
  SIDEBAR_PATH,
  sidebarPathSource,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }),
)(SidebarPath))
