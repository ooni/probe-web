import React from "react";
import { useIntl } from "react-intl";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeReact, { createElement: React.createElement });

const FormattedMarkdownMessage = ({
  id,
  defaultMessage,
  values,
  description,
}) => {
  const { formatMessage } = useIntl();
  const messageDescriptor = { id, defaultMessage, description };
  const message = formatMessage(messageDescriptor, values);
  console.log(message);
  return processor.processSync(message).result;
};

export default FormattedMarkdownMessage;
