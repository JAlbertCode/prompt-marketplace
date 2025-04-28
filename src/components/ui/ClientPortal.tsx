'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ClientPortalProps {
  children: ReactNode;
  selector?: string;
}

/**
 * A component that renders children into a DOM node that exists outside
 * the DOM hierarchy of the parent component, ensuring it works with SSR
 */
const ClientPortal = ({ children, selector = 'body' }: ClientPortalProps) => {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set the ref to the body or another element if a selector is provided
    ref.current = document.querySelector(selector);
    setMounted(true);
  }, [selector]);

  // Client-side only rendering for portals
  return mounted && ref.current ? createPortal(children, ref.current) : null;
};

export default ClientPortal;
