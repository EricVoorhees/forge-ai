import Component_2_1 from './Component_2_1';
import Component_2_2 from './Component_2_2';
import Component_2_3 from './Component_2_3';
import Component_2_4 from './Component_2_4';
import Component_2_5 from './Component_2_5';
import Component_2_6 from './Component_2_6';
import Component_2_7 from './Component_2_7';
import Component_2_8 from './Component_2_8';
import Component_2_9 from './Component_2_9';
import Component_2_10 from './Component_2_10';
import Component_2_11 from './Component_2_11';
import Component_2_12 from './Component_2_12';
import Component_2_13 from './Component_2_13';
import Component_2_14 from './Component_2_14';

function Component_2() {
  return (
    <div
      className="relative z-[1] flex flex-col justify-start"
      data-component-id="Component_2"
    >
      <div className="w-[1080px] max-w-[1080px] z-[1] overflow-x-hidden grow basis-[0%] mx-auto pb-[120px]">
        <div className="w-full flex flex-col items-center mb-[180px]">
          <div className="text-[#f7f8fc] leading-[60px] font-semibold text-[32px] text-center w-full h-[120px] flex justify-center items-center caret-[#f7f8fc] mt-[100px] mb-3">
            Ask Qwen, Know More
          </div>
          <div className="bg-[#414149] w-full h-32 max-w-[800px] relative mb-7 p-4 rounded-br-[24px] rounded-t-[24px] rounded-bl-[24px]">
            <textarea
              placeholder="Qwen에게 물어보세요 더 많이 알아보기"
              rows="2"
              className="bg-[rgba(0,0,0,0)] text-[#f7f8fc] leading-[28px] text-[16px] tracking-[-0.32px] w-full caret-[#8583f6] resize-none p-0"
            ></textarea>
            <div className="bg-[#797b89] w-8 h-8 absolute flex justify-center items-center rounded-br-[999px] rounded-t-[999px] rounded-bl-[999px] left-auto right-4 top-auto bottom-4">
              <i className="text-white leading-none not-italic [font-family:iconfont,system-ui,sans-serif] text-[24px] block caret-white"></i>
            </div>
          </div>
          <Component_2_1 />
        </div>
        <div className="w-full flex gap-y-5 gap-x-5 mb-[120px]">
          <Component_2_2 />
          <Component_2_3 />
          <Component_2_4 />
        </div>
        <div className="text-center w-full flex flex-col items-center mb-[60px]">
          <div className="text-[#f7f8fc] leading-[36px] font-semibold text-[24px] flex items-center caret-[#f7f8fc] mb-2">
            Product Features
          </div>
          <div className="bg-[rgba(255,255,255,0)] text-[#797b89] leading-[28px] tracking-[-0.32px] h-12 relative z-[2] flex justify-center items-center gap-y-1 gap-x-1 caret-[#797b89] px-4 py-1 rounded-br-[999px] rounded-t-[999px] rounded-bl-[999px]">
            <span className="block caret-[#797b89]">Explore Qwen Chat</span>
            <i className="leading-none not-italic [font-family:iconfont,system-ui,sans-serif] text-[24px] block caret-[#797b89]"></i>
          </div>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-y-12 gap-x-5 mb-[120px]">
          <Component_2_5 />
          <Component_2_6 />
          <Component_2_7 />
          <Component_2_8 />
          <Component_2_9 />
          <Component_2_10 />
        </div>
        <div className="text-center w-full flex flex-col items-center mb-[60px]">
          <div className="text-[#f7f8fc] leading-[36px] font-semibold text-[24px] flex items-center caret-[#f7f8fc] mb-2">
            Latest Research
          </div>
          <div className="bg-[rgba(255,255,255,0)] text-[#797b89] leading-[28px] tracking-[-0.32px] h-12 relative z-[2] flex justify-center items-center gap-y-1 gap-x-1 caret-[#797b89] px-4 py-1 rounded-br-[999px] rounded-t-[999px] rounded-bl-[999px]">
            <span className="block caret-[#797b89]">View all</span>
            <i className="leading-none not-italic [font-family:iconfont,system-ui,sans-serif] text-[24px] block caret-[#797b89]"></i>
          </div>
        </div>
        <div className="w-full flex flex-wrap gap-y-12 gap-x-5 mb-[120px]">
          <Component_2_11 />
          <Component_2_12 />
          <Component_2_13 />
          <Component_2_14 />
        </div>
      </div>
    </div>
  );
}

export default Component_2;
