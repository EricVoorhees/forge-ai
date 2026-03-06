import Component_2_2_1 from './Component_2_2_1';

function Component_2_2() {
  return (
    <div
      className="bg-[#1d1d20] w-[305px] relative z-0 flex overflow-x-hidden overflow-y-hidden flex-col justify-between gap-y-12 gap-x-12 will-change-[width,height] rounded-br-[12px] rounded-t-[12px] rounded-bl-[12px]"
      data-component-id="Component_2_2"
    >
      <Component_2_2_1 />
      <div className="w-[464px] relative overflow-x-hidden overflow-y-hidden mx-8">
        <img
          src="https://img.alicdn.com/imgextra/i1/O1CN01n5c6Yd1koqsPilZLG_!!6000000004731-2-tps-1398-1011.png"
          alt="mine"
          className="align-bottom w-full relative left-0 right-auto top-0 bottom-auto"
        />
        <img
          src="https://img.alicdn.com/imgextra/i1/O1CN01n5c6Yd1koqsPilZLG_!!6000000004731-2-tps-1398-1011.png"
          alt="mine"
          className="align-bottom w-full absolute z-0 block left-0 right-auto top-0 bottom-auto"
        />
        <img
          src="https://img.alicdn.com/imgextra/i1/O1CN01JN7cve1zIzYfd0QDK_!!6000000006692-2-tps-1398-1011.png"
          alt="mine"
          className="align-bottom w-full absolute z-[1] block left-0 right-auto top-0 bottom-auto"
        />
      </div>
    </div>
  );
}

export default Component_2_2;
