import ReportalBase from "r-reportal-base";
import ZoomableTreemap from "./treemap";

window.Reportal = window.Reportal || {};
ReportalBase.mixin(window.Reportal,{
  ZoomableTreemap
});

export default ZoomableTreemap



