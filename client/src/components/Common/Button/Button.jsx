import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'outline-gold'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon,
  iconPosition = 'right',
  onClick,
  type = 'button',
  className = '',
  href,
  to,
  ...props
}) => {
  const btnClasses = `btn btn-${variant} btn-${size} ${className}`;
  const targetPath = to || href;

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
    </>
  );

  if (targetPath) {
    const isInternalRoute = targetPath.startsWith('/');
    const isHashAnchor = targetPath.startsWith('#');

    if (isInternalRoute) {
      return (
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'inline-block' }}
        >
          <Link to={targetPath} className={btnClasses} {...props}>
            {content}
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.a
        href={targetPath}
        className={btnClasses}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      className={btnClasses}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {content}
    </motion.button>
  );
};

export default Button;
