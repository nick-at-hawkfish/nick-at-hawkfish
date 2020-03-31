import React, { createElement, useState, useEffect } from "react";
import { createClient } from "contentful";

import "../styles/kit.scss";

const SPACE = "pae8b0p2q3d7";
const ENVIRONMENT = "master";
const PREVIEW_TOKEN = "oaV47H31LY9veFRp0BQV3LSLsi2b6tc06ams8o-IsN0";

const client = createClient({
  space: SPACE,
  environment: ENVIRONMENT,
  accessToken: PREVIEW_TOKEN,
  host: "preview.contentful.com"
});

// all the components we have made available.
// In production we'd probably lazy load these.
const Row = ({ color, backgroundImage, backgroundColor, fluid, children }) => {
  return (
    <div
      className="bbg-row"
      css={{
        color: color,
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none"
      }}
    >
      <div className="bbg-row--content">{children}</div>
    </div>
  );
};

const Column = ({ desktopSpan, children }) => {
  return (
    <div className={`bbg-column bbg-column--width-${desktopSpan}`}>
      {children}
    </div>
  );
};

const Heading = ({ level, content }) => {
  const Comp = level;
  return <Comp>{content}</Comp>;
};

const Image = ({ src, alt }) => {
  return <img src={src} alt={alt} css={{ width: "100%" }} />;
};

const WYSIWYG = ({ content }) => {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

const Button = ({ href, bgColor, textColor, content }) => (
  <a
    href={href}
    css={{
      textAlign: "center",
      textTransform: "uppercase",
      display: "inline-block",
      padding: "12px 24px",
      backgroundColor: bgColor,
      color: textColor,
      textDecoration: "none"
    }}
  >
    {content}
  </a>
);

const Separator = () => <hr />;

const Form = ({ form }) => {
  return <div>Here would go a form with name {form}</div>;
};

// a map from component name to implementation
const componentMap = new Map();
componentMap.set("row", Row);
componentMap.set("column", Column);
componentMap.set("Heading", Heading);
componentMap.set("Image", Image);
componentMap.set("WYSIWYG", WYSIWYG);
componentMap.set("Button", Button);
componentMap.set("Separator", Separator);
componentMap.set("Form", Form);

// recursive function to convert JSON to React elements
const render = definition => {
  // TODO handle case when no component exists with given name
  const element = componentMap.get(definition.name);
  return createElement(
    element,
    { ...definition.props, key: definition.id },
    ...definition.children.map(render)
  );
};

// Layout here is the JSON that this page builder produces
// We wrap everything in a fragment to handle the top level array of rows.
const PageContent = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("entityID")) {
      client
        .getEntry(params.get("entityID"))
        .then(data => {
          console.log("data", data);
          setPage(data.fields);
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
        });
    }
  }, []);
  return loading ? (
    <div>Loading...</div>
  ) : page ? (
    <div>
      <h1>{page.title}</h1>
      <h3>{page.template} Template</h3>
      {page.layout.map(render)}
    </div>
  ) : (
    <p>No data was found</p>
  );
};

export default PageContent;
