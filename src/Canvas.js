import React, { Component } from 'react';
import CanvasDraw from 'react-canvas-draw';

import "./Canvas.css"

class CanvasComponent extends Component {
    state = {
      brushColor: '#000000',
      brushRadius: 10,
    };

    reset = () => {
      this.mainCanvas.clear();
      this.setState({
        brushColor: '#000000',
        brushRadius: 10,
      });
    };

    capture = async () => {
      const start_time = Date.now()
      const saveData = await this.mainCanvas.getSaveData();
      await this.hiddenCanvas.loadSaveData(saveData, true);
      const imageURL = await this.hiddenCanvas.getDataURL("png", false, "#FFFFFF");
      console.log(`📸Capturing Time: ${Date.now() - start_time}`);
      return imageURL
    }

    renderBrushSizePicker = () => {
      const radii = [
        { name: 'small', radius: 5 },
        { name: 'medium', radius: 10 },
        { name: 'large', radius: 15 },
      ];

      return radii.map(radius => (
        <button
          key={radius.name}
          style={{ width: radius.radius * 2, height: radius.radius * 2, borderRadius: '50%' }}
          onClick={() => this.setBrushSize(radius.radius)}
          title={`Brush size: ${radius.name}`}
        />
      ));
    };

    setBrushSize = (radius) => {
      this.setState({ brushRadius: radius })
    };

    setColor = (color) => {
      this.setState({ brushColor: color });
    };

    renderColorPicker = () => {
      const colors = ['#000000',  '#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#800080', '#FF00FF', '#A52A2A', '#FFFFFF', '#808080', ];
      return colors.map(color => (
        <button key={color} style={{ backgroundColor: color }} onClick={() => this.setColor(color)} />
      ));
    };

    render() {
      return (
        <div className='canvas-grid'>
            <div className="brush-size-picker">
                {this.renderBrushSizePicker()}
            </div>
            <div className="color-picker">
                {this.renderColorPicker()}
                <button onClick={() => this.mainCanvas.undo()} className="undo-button">
                    <i className="fas fa-undo"></i> {/* This is the FontAwesome undo icon */}
                </button>
            </div>
            <div className="canvas-area">
                <CanvasDraw
                    ref={canvasDraw => (this.mainCanvas = canvasDraw)}
                    brushColor={this.state.brushColor}
                    brushRadius={this.state.brushRadius}
                    canvasWidth={600}
                    canvasHeight={600}
                />
            </div>
            <CanvasDraw
              ref={canvasDraw => (this.hiddenCanvas = canvasDraw)}
              brushColor={this.state.brushColor}
              brushRadius={this.state.brushRadius}
              canvasWidth={600}
              canvasHeight={600}
              style={{
                position: 'absolute',
                left: '-9999px', // Move the canvas off-screen
                top: '-9999px',
              }} // Hide the canvas visually
            />
        </div>
      );
    }
  }

  export default CanvasComponent;
