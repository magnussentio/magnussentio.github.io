import { useState, useEffect } from "react"; 
import { useGeolocated } from "react-geolocated";
import Rune from './Rune';

export default function CipherCompass() {
  
 const {
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false
    },
    watchPosition : true,
    userDecisionTimeout: 5000
  });
  const [distanceCalc, setDistance] = useState(0);
  const [pointDegree, setPointDegree] = useState(0);
  const [compassCircleTransformStyle, setCompassCircleTransform] = useState(
    "translate(-50%, -50%)"
  );
  const [myPointStyle, setMypointStyle] = useState(0);

  const locationHandler = (coords) => {
    const { latitude, longitude } = coords;
    const resP = calcDegreeToPoint(latitude, longitude);
    console.log("resP", resP);
    if (resP < 0) {
      setPointDegree(resP + 360);
    } else {
      setPointDegree(resP);
    }
  };

  useEffect(() => {
    if (!isGeolocationAvailable) {
      alert("Your browser does not support Geolocation");
    } else if (!isGeolocationEnabled) {
      alert(
        "Geolocation is not enabled, Please allow the location check your setting"
      );
    } else if (coords) {
      locationHandler(coords);
    }
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);
  const isIOS = () => {
    return (
      navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
      navigator.userAgent.match(/AppleWebKit/)
    );
  };

  const calcDegreeToPoint = (latitude, longitude) => {
    // SPECIFIED POINTING GEO-LOCATION
    const point = {
      lat: 40.44187927220261,
      lng: -80.01270058756026
    };
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(latitude-point.lat);  // deg2rad below
    var dLon = deg2rad(longitude-point.lng); 
    var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point.lat)) * Math.cos(deg2rad(latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    
    setDistance(d);
    const phiK = (point.lat * Math.PI) / 180.0;
    const lambdaK = (point.lng * Math.PI) / 180.0;
    const phi = (latitude * Math.PI) / 180.0;
    const lambda = (longitude * Math.PI) / 180.0;
    const psi =
      (180.0 / Math.PI) *
      Math.atan2(
        Math.sin(lambdaK - lambda),
        Math.cos(phi) * Math.tan(phiK) -
          Math.sin(phi) * Math.cos(lambdaK - lambda)
      );
    return Math.round(psi);
  };
  function deg2rad(deg) {
  return deg * (Math.PI/180)
}
  const startCompass = async () => {
    const checkIos = isIOS();
    if (checkIos) {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handler, true);
          } else {
            alert("Device Orientation must be allowed to use the Cipher.");
          }
        })
        .catch(() => alert("not supported"));
    } else {
      window.addEventListener("deviceorientationabsolute", handler, true);
    }
  };
  const handler = (e) => {
    const compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
    const compassCircleTransform = `translate(-50%, -50%) rotate(${-compass}deg)`;
    setCompassCircleTransform(compassCircleTransform);

    // ±15 degree and <0.25km
    if (distanceCalc < 0.25) {
      return (
        <Rune />
        );
    };

    if (
      (pointDegree < Math.abs(compass) &&
        pointDegree + 15 > Math.abs(compass)) ||
      pointDegree > Math.abs(compass + 15) ||
      pointDegree < Math.abs(compass)
    ) {
      setMypointStyle(0);
    } else if (pointDegree) {
      setMypointStyle(1);
    }
  }; 
 



  return (
    <div className="App">
      <div>Distance to Point:{distanceCalc}km</div>
      <div>Point Style:{myPointStyle}</div>
      <div>Point Degree:{pointDegree}</div>
      <div>Current Latitude:{coords?.latitude}</div>
      <div>Current Longitude:{coords?.longitude}</div>
      <h1>Cipher</h1>
      <div className="compass">
        <div className="arrow" />
        <div
          className="compass-circle"
          style={{ transform: compassCircleTransformStyle }}
        />
        <div className="my-point" style={{ opacity: myPointStyle }} />
      </div>
      <button className="start-btn" onClick={startCompass}>
        Start compass
      </button>
    </div>
  );
}
