import Component_3_1 from './Component_3_1';
import Component_3_2 from './Component_3_2';
import Component_3_3 from './Component_3_3';
import Component_3_4 from './Component_3_4';

function Component_3() {
  return (
    <div
      className="pt-[60px] pb-8 px-[60px]"
      data-style-id="style-6-1772840596782"
      data-component-id="Component_3"
    >
      <div className="max-w-[1440px] flex flex-col justify-center items-center mx-auto">
        <div className="w-full flex mb-20">
          <Component_3_1 />
          <div className="grow basis-[0%] ml-5">
            <div>
              <div className="text-[#797b89] leading-[21px] text-[14px] caret-[#797b89]">
                Qwen Chat
              </div>
              <div className="mt-6">
                <div className="text-[#f7f8fc] leading-[21px] text-[14px] relative flex items-center caret-[#f7f8fc]">
                  <div className="relative flex items-center caret-[#f7f8fc]">
                    <div className="flex items-center caret-[#f7f8fc]">
                      Qwen Chat Overview
                    </div>
                  </div>
                </div>
                <div className="text-[#f7f8fc] leading-[21px] text-[14px] relative flex items-center caret-[#f7f8fc] mt-6">
                  <div className="relative flex items-center caret-[#f7f8fc]">
                    <div className="flex items-center caret-[#f7f8fc]">
                      Download
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Component_3_2 />
          <Component_3_3 />
          <div className="grow basis-[0%] ml-5">
            <div>
              <div className="text-[#797b89] leading-[21px] text-[14px] caret-[#797b89]">
                Terms & Policies
              </div>
              <div className="mt-6">
                <div className="text-[#f7f8fc] leading-[21px] text-[14px] relative flex items-center caret-[#f7f8fc]">
                  <div className="relative flex items-center caret-[#f7f8fc]">
                    <div className="flex items-center caret-[#f7f8fc]">
                      Terms of Service
                    </div>
                  </div>
                </div>
                <div className="text-[#f7f8fc] leading-[21px] text-[14px] relative flex items-center caret-[#f7f8fc] mt-6">
                  <div className="relative flex items-center caret-[#f7f8fc]">
                    <div className="flex items-center caret-[#f7f8fc]">
                      Privacy Policy
                    </div>
                  </div>
                </div>
                <div className="text-[#f7f8fc] leading-[21px] text-[14px] relative flex items-center caret-[#f7f8fc] mt-6">
                  <div className="relative flex items-center caret-[#f7f8fc]">
                    <div className="flex items-center caret-[#f7f8fc]">
                      Usage Policy
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col items-center">
          <Component_3_4 />
        </div>
      </div>
    </div>
  );
}

export default Component_3;
