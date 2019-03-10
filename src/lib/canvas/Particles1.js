import React from 'react';
import { compose, withHandlers, withProps, withPropsOnChange } from 'recompose';
import PropTypes from 'prop-types';
import each from 'lodash/each';
import color from 'color';

import AnimatedCanvas from './AnimatedCanvas';
import PointSystem from '../util/PointSystem';

const drawCirclePath = ({ ctx, radius, p }) => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
  ctx.closePath();
};

const drawLinePath = ({ ctx, p, q, color}) => {
  ctx.beginPath();
  if (color) {
    ctx.strokeStyle = color;
  }
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(q.x, q.y);
  ctx.closePath();
};

const getDistanceSquared = ({ p, q }) => {
  return Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2);
};

const Particles1 = compose(
  withProps({
    data: {},
  }),
  withPropsOnChange(['segmentColor'], ({ segmentColor }) => ({
    segmentColorObject: color(segmentColor),
  })),
  withHandlers({
    setup: ({ data, particleDensity }) => ({ canvasHeight, canvasWidth, devicePixelRatio, segmentLength }) => {
      data.pointSystem = new PointSystem({ canvasHeight, canvasWidth, devicePixelRatio, particleDensity, edgeThreshold: segmentLength });
    },
    update: ({ addPointsInRegion, data, particleFill, segmentLength, segmentWidth }) => ({ canvasHeight, canvasWidth, ctx, devicePixelRatio }) => {
      ctx.lineWidth = segmentWidth;
      ctx.fillStyle = particleFill;

      data.pointSystem.setSize({ canvasHeight, canvasWidth, devicePixelRatio });
    },
    draw: ({ data, particleSize, particleStrokeColor, particleStrokeWidth, segmentColorObject, segmentLength, segmentWidth }) => ({ ctx, canvasHeight, canvasWidth }) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      data.pointSystem.tick();

      each(data.pointSystem.points, (p) => {
        each(data.pointSystem.points, (q) => {
          const distanceSquared = getDistanceSquared({ p, q });
          if(distanceSquared < (segmentLength * segmentLength)) {
            const color = segmentColorObject.fade(distanceSquared / (segmentLength * segmentLength));
            drawLinePath({ ctx, p, q, color });
            ctx.stroke();
          }
        });
      });

      // conserve state changes
      if(particleStrokeWidth) {
        ctx.strokeStyle = particleStrokeColor;
        ctx.lineWidth = particleStrokeWidth;
      }

      each(data.pointSystem.points, (p) => {
        const radius = particleSize / 2;
        drawCirclePath({ ctx, radius, p });
        ctx.fill();

        if(particleStrokeWidth) {
          ctx.stroke();
        }
      });

      // revert for next draw
      if(particleStrokeWidth) {
        ctx.lineWidth = segmentWidth;
      }
    },
  }),
)(AnimatedCanvas);

Particles1.propTypes = {
  particleDensity: PropTypes.number,
  particleFill: PropTypes.string,
  particleSize: PropTypes.number,
  particleStrokeColor: PropTypes.string,
  particleStrokeWidth: PropTypes.number,
  segmentColor: PropTypes.string,
  segmentLength: PropTypes.number,
  segmentWidth: PropTypes.number,

  // inherited from AnimatedCanvas
  className: PropTypes.string,
  devicePixelRatio: PropTypes.number,
  disabled: PropTypes.bool,
  disablingDelay: PropTypes.number,
  maxFps: PropTypes.number,
  style: PropTypes.object,
};

Particles1.defaultProps = {
  particleDensity: 0.0002,
  particleFill: '#888',
  particleSize: 6,
  particleStrokeColor: 'transparent',
  particleStrokeWidth: 0,
  segmentColor: '#888',
  segmentLength: 140,
  segmentWidth: 1,
};

Particles1.demoProps = {
  particleFill: '#902',
  particleSize: 20,
  particleStrokeColor: '#f03',
  particleStrokeWidth: 4,
  segmentColor: '#0cf',
  segmentWidth: 3,
};

Particles1.knobConfig = {
  particleFill: { type: 'color' },
  particleSize: {},
  particleStrokeColor: { type: 'color' },
  particleStrokeWidth: {},
  segmentColor: { type: 'color' },
  segmentWidth: {},
};

export default Particles1;
