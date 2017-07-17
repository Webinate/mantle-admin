import * as React from 'react';

export default ( props: React.HTMLAttributes<any> ) => {
  return (
    <div
      { ...props }
      style={{
        ...props.style, ...{
          height: '100%',
          background: '#efefef',
          backgroundImage: `url('../images/rocks.svg')`,
          backgroundSize: '100% 100%'
        }
      }}
    >
      {props.children}
    </div>
  );
}