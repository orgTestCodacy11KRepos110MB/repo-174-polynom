import React, { Component, PropTypes } from "react"
import Settings, { Setting } from "Settings"
import Range from "Range"
import SidebarPointParameter from "./SidebarPointParameter"
import { inRange } from "../../src/utils"

class SidebarPointQ extends Component {
  handleX1Change = (e) => {
    const { project, point } = this.props
    const x1 = inRange(parseInt(e.target.value), 0, project.width)

    this.props.onParamsChange(point.id, { ...point.parameters, x1 })
  };

  handleY1Change = (e) => {
    const { project, point } = this.props
    const y1 = inRange(parseInt(e.target.value), 0, project.height)

    this.props.onParamsChange(point.id, { ...point.parameters, y1 })
  };

  render() {
    const { project, gridStep, point } = this.props

    return (
      <SidebarPointParameter>
        <Settings>
          <Setting label="Anchor X position">
            <Range
              min={ 0 }
              max={ project.width }
              step={ gridStep }
              value={ point.parameters.x1 }
              onChange={ this.handleX1Change } />
          </Setting>
        </Settings>

        <Settings>
          <Setting label="Anchor Y position">
            <Range
              min={ 0 }
              max={ project.height }
              step={ gridStep }
              value={ point.parameters.y1 }
              onChange={ this.handleY1Change } />
          </Setting>
        </Settings>
      </SidebarPointParameter>
    )
  }
}

SidebarPointQ.propTypes = {
  onParamsChange: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
  gridStep: PropTypes.number.isRequired,
  point: PropTypes.object.isRequired,
}

export default SidebarPointQ
