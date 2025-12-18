// MODAL
const openModalButtons = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.querySelector(button.dataset.modalTarget);
    openModal(modal);
  });
});

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    closeModal(modal);
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    closeModal(modal);
  });
});

function openModal(modal) {
  if (modal == null) return;
  modal.classList.add("active");
  overlay.classList.add("active");
}

function closeModal(modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

$(document).ready(function () {
  var slider = $("#features-slider").slippry({
    // general elements & wrapper
    slippryWrapper: '<div class="sy-box features-slider" />', // wrapper to wrap everything, including pager
    // elements: 'li', // elments cointaining slide content

    // options
    adaptiveHeight: true, // height of the sliders adapts to current
    captions: false,

    // pager
    pagerClass: "sy-pager",

    // transitions
    transition: "fade", // fade, horizontal, kenburns, false
    speed: 1200,
    pause: 5000,
    auto: false,

    // slideshow
    autoDirection: "next"
  });

  $("h1").on("click", function () {
    slider.destroySlider();
  });

  var eventFired = 0;

  if ($(window).width() < 960) {
    slider.destroySlider();
  } else {
    //alert('More than 960');
    eventFired = 1;
  }

  $(window).on("resize", function () {
    if (!eventFired) {
      if ($(window).width() < 960) {
        slider.destroySlider();
      } else {
        //alert('More than 960 resize');
        slider.reloadSlider();
      }
    }
  });

  $(window).on("load", function () {
    if (!eventFired) {
      if ($(window).width() < 960) {
        slider.destroySlider();
      } else {
        //alert('More than 960 resize');
        slider.reloadSlider();
      }
    }
  });
});

// ROI CALCULATOR
const form = document.getElementById("roi-calculator");
const formInputs = document.querySelectorAll(".input");

function Calculator(
    totalSamplesProcessedPerDayStr,
    labTechnicianCostPerYearStr,
    totalStaffSupportingAssayStr,
    sampleProcessingLaborMinsPerSampleStr,
    errorRateStr
    ) {
    // Convert all inputs to numbers immediately to prevent string math errors
    const totalSamplesProcessedPerDay = Number(totalSamplesProcessedPerDayStr);
    const labTechnicianCostPerYear = Number(labTechnicianCostPerYearStr);
    const totalStaffSupportingAssay = Number(totalStaffSupportingAssayStr);
    const sampleProcessingLaborMinsPerSample = Number(sampleProcessingLaborMinsPerSampleStr);
    const errorRate = Number(errorRateStr);

    // FIXED COSTS
    this.hiddenFixedCost = {
      sampleTubeCostPack: 294,
      packSize: 500,
      sampleTubeCostSample: null,
      homogenizationProbeCostPack: 4912,
      homogenizationProbeSample: null,
      reagentBuffferCost: 0.05,
      prep96SystemCost: 130000,
      totalStaffSupportingAssay96: 1
    },

    // HIDDEN COSTS
    this.hiddenCost = {
      laborCostTosetupAutomationSystemPerBatch: null,
      laborCostTosetupAutomationSystemPerBatch96: null,
      totalSampleTubeCostBatchCost: null,
      totalHomogenizationProbeBatchCost: null,
      totalReagentBufferBatchCost: null,
      totalLaborCostToProcessSampleBatch: null,
      totalLaborCostToProcessSampleBatch96: 0,
      dailyTotalPerSample: null,
      dailyTotalPerBatch: null,
      dailyTotalPerSample96: null,
      dailyTotalPerBatch96: null
    },

    // HIDDEN TIME
    this.hiddenTime = {
      timeToSetUpAutomationSystem: null,
      timeToSetUpAutomationSystem96: 5,
      workingDaysAYear: 250
    },

    // OUTPUT VALUES
    this.outputs = {
      numberOfSamplesSavedEachYear: null,
      numberOfSamplesSavedEachYear96: null,
      additionalStaffCostSupportingAssay: null,
      laborHoursGainedEachYearUsingPrep96: null,
      estimatedReturnOnInvestmentInMonths: null,
      estimatedSavingsEachYear: null,
      numberOfSamplesToBeRepeatedPerYear: null,
      annualCost: null,
      annualCost96: null,
      repeatSampleCost: null,
      totalAnnualCost: null,
      laborTimeSavedPerYearHours: null,
      laborSavingsPerYear: null,
      laborTimeSavedPerYearOnRepeatsHours: null,
      laborSavingsPerYearOnRepeats: null,
      totalLaborSavingsPerYearHours: null,
      totalLaborSavingsPerYear: null,
      totalSavingsPerYear: null,
      savingsDIfference: null,
      roiMonths: null
    },

    // LABOR COSTS
    this.laborCost = {
      averageLabTechnicainSalary: 100000,
      perDay: null,
      perHour: null,
      perMinute: null
    },

    // CALCULATE HIIDEN FIXED COSTS
    this.hiddenFixedCostFn = function () {
      this.hiddenFixedCost.sampleTubeCostSample = 
          this.hiddenFixedCost.sampleTubeCostPack /
          this.hiddenFixedCost.packSize;
      
      this.hiddenFixedCost.homogenizationProbeSample = 
          this.hiddenFixedCost.homogenizationProbeCostPack /
          this.hiddenFixedCost.packSize;
    },

    // CALCULATE HIIDEN LABOR COST
    this.laborCostFn = function () {
      this.laborCost.perDay = labTechnicianCostPerYear / 250;
      this.laborCost.perHour = this.laborCost.perDay / 8;
      this.laborCost.perMinute = this.laborCost.perHour / 60;
    };
    this.hiddenFixedCostFn(),
    this.laborCostFn(),
    this.hiddenCostFn = function () {
      this.hiddenCost.laborCostTosetupAutomationSystemPerBatch96 = 
        this.hiddenTime.timeToSetUpAutomationSystem96 * this.laborCost.perMinute;
      
      this.hiddenCost.laborCostTosetupAutomationSystemPerBatch = 
        (this.hiddenTime.timeToSetUpAutomationSystem || 0) * this.laborCost.perMinute;
      
      this.hiddenCost.totalSampleTubeCostBatchCost = 
        this.hiddenFixedCost.sampleTubeCostSample *
          totalSamplesProcessedPerDay;
      
      this.hiddenCost.totalHomogenizationProbeBatchCost = 
        this.hiddenFixedCost.homogenizationProbeSample *
          totalSamplesProcessedPerDay;
      
      this.hiddenCost.totalReagentBufferBatchCost = 
          this.hiddenFixedCost.reagentBuffferCost *
          totalSamplesProcessedPerDay;
      
      this.hiddenCost.totalLaborCostToProcessSampleBatch =
        sampleProcessingLaborMinsPerSample *
        this.laborCost.perMinute *
        totalSamplesProcessedPerDay;
      
      this.hiddenCost.dailyTotalPerBatch = 
        this.hiddenCost.totalSampleTubeCostBatchCost +
        this.hiddenCost.totalHomogenizationProbeBatchCost +
        this.hiddenCost.totalReagentBufferBatchCost +
        this.hiddenCost.totalLaborCostToProcessSampleBatch;
      
      this.hiddenCost.dailyTotalPerBatch96 = 
        this.hiddenCost.totalSampleTubeCostBatchCost +
        this.hiddenCost.totalHomogenizationProbeBatchCost +
        this.hiddenCost.totalReagentBufferBatchCost +
        this.hiddenCost.totalLaborCostToProcessSampleBatch96;
      
      this.hiddenCost.dailyTotalPerSample = 
        this.hiddenCost.dailyTotalPerBatch / totalSamplesProcessedPerDay;
      
      this.hiddenCost.dailyTotalPerSample96 = 
        this.hiddenCost.dailyTotalPerBatch96 / totalSamplesProcessedPerDay;
    },
    this.hiddenCostFn(),
    this.outPutsFn = function () {
      // Calculate additional staff costs based on the salary input instead of hardcoded millions
      const additionalStaffCount = Math.max(0, totalStaffSupportingAssay - 1);
      this.outputs.additionalStaffCostSupportingAssay = additionalStaffCount * labTechnicianCostPerYear;

      this.outputs.numberOfSamplesSavedEachYear = 
        this.hiddenTime.workingDaysAYear * totalSamplesProcessedPerDay;
      
      this.outputs.numberOfSamplesToBeRepeatedPerYear = 
        (this.outputs.numberOfSamplesSavedEachYear / 100) * errorRate;
      
      this.outputs.annualCost = 
        this.hiddenCost.dailyTotalPerSample *
          this.outputs.numberOfSamplesSavedEachYear;
      
      this.outputs.annualCost96 = 
        this.hiddenCost.dailyTotalPerSample96 *
          this.outputs.numberOfSamplesSavedEachYear;
      
      this.outputs.repeatSampleCost = 
          this.hiddenCost.dailyTotalPerSample *
            this.outputs.numberOfSamplesToBeRepeatedPerYear;
      
      this.outputs.totalAnnualCost = 
        this.outputs.annualCost + this.outputs.repeatSampleCost + this.outputs.additionalStaffCostSupportingAssay;
      
      this.outputs.laborTimeSavedPerYearHours = 
          (this.outputs.numberOfSamplesSavedEachYear *
            sampleProcessingLaborMinsPerSample) /
            60;
      
      this.outputs.laborSavingsPerYear = 
          this.outputs.laborTimeSavedPerYearHours * this.laborCost.perHour;
      
      this.outputs.laborTimeSavedPerYearOnRepeatsHours = 
        (this.outputs.numberOfSamplesToBeRepeatedPerYear *
          sampleProcessingLaborMinsPerSample) /
          60;
      
      this.outputs.laborSavingsPerYearOnRepeats = 
        this.outputs.laborTimeSavedPerYearOnRepeatsHours *
          this.laborCost.perHour;
      
      this.outputs.totalLaborSavingsPerYearHours = 
        this.outputs.laborTimeSavedPerYearHours +
          this.outputs.laborTimeSavedPerYearOnRepeatsHours;

      this.outputs.totalLaborSavingsPerYear = 
        this.outputs.laborSavingsPerYear +
          this.outputs.laborSavingsPerYearOnRepeats;
      
      // Calculate real difference in operational costs
      this.outputs.savingsDIfference = 
        this.outputs.totalAnnualCost - this.outputs.annualCost96;

      // Total savings is the sum of labor hours saved + operational cost difference
      this.outputs.totalSavingsPerYear = 
        this.outputs.totalLaborSavingsPerYear + this.outputs.savingsDIfference;

      // Calculate ROI in months
      if (this.outputs.totalSavingsPerYear > 0) {
        this.outputs.roiMonths = Math.max(1, Math.round(
            12 * (this.hiddenFixedCost.prep96SystemCost / this.outputs.totalSavingsPerYear)
          ));
      } else {
        this.outputs.roiMonths = "N/A";
      }
    },
    this.animateValuesFn = function() {
        const outputs_span = document.querySelectorAll('[data-output]');
        outputs_span.forEach(span => {
            if(span.classList.contains("active")){
                span.classList.remove("active")
                setTimeout(() => {
                    span.classList.add("active");
                }, 100);
            } else {
                span.classList.add("active");
            }
            
        });
    },
    this.outPutsFn();
  this.displayValuesFn = function () {
    const number_of_samples_saved_each_year_using_prep_96 =
      document.querySelector(
        '[data-output="number_of_samples_saved_each_year_using_prep_96"]'
      );
    const labor_hours_gained_each_year_using_prep_96 = document.querySelector(
      '[data-output="labor_hours_gained_each_year_using_prep_96"]'
    );
    const estimated_return_on_investment_in_months = document.querySelector(
      '[data-output="estimated_return_on_investment_in_months"]'
    );
    const estimated_savings_each_year = document.querySelector(
      '[data-output="estimated_savings_each_year"]'
    );

    number_of_samples_saved_each_year_using_prep_96.innerHTML =
      numberWithCommas(this.outputs.numberOfSamplesToBeRepeatedPerYear);
      
    labor_hours_gained_each_year_using_prep_96.innerHTML = 
      this.outputs.totalLaborSavingsPerYearHours.toFixed(2);

    estimated_return_on_investment_in_months.innerHTML = this.outputs.roiMonths;
    estimated_savings_each_year.innerHTML =
      "$" + numberWithCommas(this.outputs.totalSavingsPerYear);
      this.animateValuesFn();
  },
    this.displayValuesFn(),

    this.displayTestVariablesFn = function () {
    // TESTING
    console.log('testing');
    const testDiv = document.querySelector(".testing");
    testDiv.style.display = "block";

    const output1 = document.querySelector(
      '[data-id="Total Sample Tube Cost Batch Cost"]'
    );
    output1.innerHTML = this.hiddenCost.totalSampleTubeCostBatchCost;

    const output2 = document.querySelector(
      '[data-id="Total Homogenization Probe Batch Cost"]'
    );
    output2.innerHTML = this.hiddenCost.totalHomogenizationProbeBatchCost;

    const output3 = document.querySelector(
      '[data-id="Total Reagent/Buffer Batch Cost"]'
    );
    output3.innerHTML = this.hiddenCost.totalReagentBufferBatchCost;

    const output4 = document.querySelector(
      '[data-id="Total Labor Cost to Process Sample Batch"]'
    );
    output4.innerHTML = this.hiddenCost.totalLaborCostToProcessSampleBatch;

    const output5 = document.querySelector(
      '[data-id="Daily Total per Sample"]'
    );
    output5.innerHTML = this.hiddenCost.dailyTotalPerSample;

    const output6 = document.querySelector('[data-id="Daily Total per Batch"]');
    output6.innerHTML = this.hiddenCost.dailyTotalPerBatch;

    const output7 = document.querySelector('[data-id="Samples/Year"]');
    output7.innerHTML = this.outputs.numberOfSamplesSavedEachYear;

    const output8 = document.querySelector(
      '[data-id="Number of samples to be repeated per Year"]'
    );
    output8.innerHTML = this.outputs.numberOfSamplesToBeRepeatedPerYear;

    const output9 = document.querySelector('[data-id="Annual Cost"]');
    output9.innerHTML = this.outputs.annualCost;

    const output10 = document.querySelector('[data-id="Repeat Sample Cost"]');
    output10.innerHTML = this.outputs.repeatSampleCost;

    const output11 = document.querySelector('[data-id="Additional Staff Cost Supporting Assay"]');
    output11.innerHTML = this.outputs.additionalStaffCostSupportingAssay;

    const output12 = document.querySelector('[data-id="Total Annual Cost"]');
    output12.innerHTML = this.outputs.totalAnnualCost;

    const output13 = document.querySelector(
      '[data-id="Labor Time Saved per Year (hours)"]'
    );
    output13.innerHTML = this.outputs.laborTimeSavedPerYearHours;

    const output14 = document.querySelector(
      '[data-id="Labor Savings per Year"]'
    );
    output14.innerHTML = this.outputs.laborSavingsPerYear;

    const output15 = document.querySelector(
      '[data-id="Labor Time Saved per Year on Repeats (hours)"]'
    );
    output15.innerHTML = this.outputs.laborTimeSavedPerYearOnRepeatsHours;

    const output16 = document.querySelector(
      '[data-id="Labor Savings per Year on Repeats"]'
    );
    output16.innerHTML = this.outputs.laborSavingsPerYearOnRepeats;

    const output17 = document.querySelector(
      '[data-id="Total Labor Savings per Year (hours)"]'
    );
    output17.innerHTML = this.outputs.totalLaborSavingsPerYearHours;

    const output18 = document.querySelector(
      '[data-id="Total Labor Savings per Year ($)"]'
    );
    output18.innerHTML = this.outputs.totalLaborSavingsPerYear;

    const output19 = document.querySelector('[data-id="Savings Difference"]');
    output19.innerHTML = this.outputs.totalSavingsPerYear;

    const output20 = document.querySelector(
      '[data-id="Total Savings per Year"]'
    );
    output20.innerHTML = this.outputs.savingsDIfference;

    const output21 = document.querySelector('[data-id="Annual Cost 96"]');
    output21.innerHTML = this.outputs.annualCost96;

    const output22 = document.querySelector(
      '[data-id="Daily Total per Sample 96"]'
    );
    output22.innerHTML = this.hiddenCost.dailyTotalPerSample96;

    const output23 = document.querySelector(
      '[data-id="Daily Total per Batch 96"]'
    );
    output23.innerHTML = this.hiddenCost.dailyTotalPerBatch96;
  };
  //this.displayTestVariablesFn();
}

form.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log('test', formInputs);
    let totalSamplesProcessedPerDay = formInputs[0].value,
      labTechnicianCostPerYear = formInputs[1].value,
      totalStaffSupportingAssay = formInputs[2].value,
      sampleProcessingLaborMinsPerSample = formInputs[3].value,
      errorRate = formInputs[4].value;
  
      new Calculator(
        totalSamplesProcessedPerDay,
        labTechnicianCostPerYear,
        totalStaffSupportingAssay,
        sampleProcessingLaborMinsPerSample,
        errorRate
    );
});

function init(){
    let totalSamplesProcessedPerDay = formInputs[0].value,
        labTechnicianCostPerYear = formInputs[1].value,
        totalStaffSupportingAssay = formInputs[2].value,
        sampleProcessingLaborMinsPerSample = formInputs[3].value,
        errorRate = formInputs[4].value;
        new Calculator(
            totalSamplesProcessedPerDay,
            labTechnicianCostPerYear,
            totalStaffSupportingAssay,
            sampleProcessingLaborMinsPerSample,
            errorRate
        );
}
init();




const inputElement1 = document.getElementById("total_staff_supporting_assay");
inputElement1.nextElementSibling.textContent = inputElement1.value;

const inputElement2 = document.getElementById(
  "sample_processing_labor_mins_per_sample"
);
inputElement2.nextElementSibling.textContent = inputElement2.value;

function handleInputChange(e) {
  let target = e.target;
  let labelElement = target.nextElementSibling;
  if (e.target.type !== "range") {
    target = document.querySelector("range");
  }
  const min = target.min;
  const max = target.max;
  const val = target.value;

  target.style.backgroundSize = ((val - min) * 100) / (max - min) + "% 100%";
  labelElement.textContent = val;
  target.value = val;
}

const rangeInputs = document.querySelectorAll('input[type="range"]');
const numberInput = document.querySelector('input[type="number"]');

rangeInputs.forEach((input) => {
  input.addEventListener("input", handleInputChange);
});

numberInput.addEventListener("input", handleInputChange);

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const selectHotspot = (e) => {
  const clickedHotspot = e.target.parentElement;
  const container = clickedHotspot.parentElement;
  console.log(clickedHotspot);
  const hotspots = container.querySelectorAll(".lg-hotspot"); 
  hotspots.forEach(hotspot => {
    if (hotspot === clickedHotspot) {
      hotspot.classList.toggle("lg-hotspot--selected");
    } else {
      hotspot.classList.remove("lg-hotspot--selected");
    }
  });
}

(() => {
  const buttons = document.querySelectorAll(".lg-hotspot");
  console.log(buttons);
  buttons.forEach(button => {
    button.addEventListener("click", selectHotspot);
  });
})();
