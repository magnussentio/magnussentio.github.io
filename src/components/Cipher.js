import { useState, useEffect } from "react"; 

export default function CipherCompass() {
  const [compassCircleTransformStyle, setCompassCircleTransform] = useState(
    "translate(-50%, -50%)"
  );

  const isIOS = () => {
    return (
      navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
      navigator.userAgent.match(/AppleWebKit/)
    );
  };

  const startCompass = () => {
    const checkIos = isIOS();
    console.log(checkIos);
    if (checkIos) {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handler, true);
          } else {
            alert("has to be allowed!");
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
  };
  return (
    <div className="compassWrapper"> 
      <div className="compass">
        <div className="arrow" />
        <div
          className="compass-circle"
          style={{ transform: compassCircleTransformStyle }}
        />
        <div className="my-point" />
      </div>
      <button className="start-btn" onClick={startCompass}>
        Start compass
      </button>
    </div>
  );
}
