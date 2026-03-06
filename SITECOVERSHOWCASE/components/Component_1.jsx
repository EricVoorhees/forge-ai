import Component_1_1 from './Component_1_1';
import Component_1_2 from './Component_1_2';

function Component_1() {
  return (
    <div
      id="headerWrap"
      className="bg-[rgba(0,0,0,0.9)] w-full relative z-[2] backdrop-blur-[30px]"
      data-component-id="Component_1"
    >
      <div className="h-20 flex justify-between items-center px-[60px]">
        <Component_1_1 />
        <Component_1_2 />
      </div>
    </div>
  );
}

export default Component_1;
