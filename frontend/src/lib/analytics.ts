import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-0JXYSSJ139";

ReactGA.initialize(MEASUREMENT_ID);

export const trackPageView = (page: string) => {
  ReactGA.send({
    hitType: "pageview",
    page,
  });
};

export const trackEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
