/**
 * @fileoverview InstructionsModal Component
 * 
 * PURPOSE:
 * This modal component provides first-time users with instructions on how to use
 * premium features. It displays feature costs, usage instructions, and a cost breakdown
 * showing current and remaining token credits. The modal includes proceed and cancel options.
 * 
 * INDEX OF STEPS:
 * 1. Import dependencies and constants
 * 2. Define component props interface
 * 3. Initialize component state and animation effects
 * 4. Render modal structure
 *    a. Modal overlay and container
 *    b. Modal header and feature introduction
 *    c. Feature instructions list
 *    d. Token cost breakdown
 *    e. Action buttons (Proceed/Cancel)
 */
"use client"
import React, { useEffect, useState } from 'react'
import { Lightbulb, X } from 'lucide-react';


///////////////////////////////////////////////////////////////////////////////
// 1. COMPONENT DEFINITION AND PROPS
///////////////////////////////////////////////////////////////////////////////

/**
 * InstructionsModal displays instructions and cost breakdown for premium features
 * @param {string} featureName - Name of the feature being purchased
 * @param {number} featureCost - Cost in tokens for the feature
 * @param {function} setShowTokenModal - Function to control modal visibility
 * @param {function} setToast - Function to trigger toast notifications
 * @param {function} setRefresh - Function to trigger a refresh after transaction
 * @returns {JSX.Element} Modal component
 */
const InstructionsModalListings = ({setShowInstructionsModal, showInstructionsModal, headerText, descriptionText, children, icon: Icon, height = 'h-screen lg:h-fit'}: {setShowInstructionsModal: (showInstructionsModal: boolean) => void, showInstructionsModal: boolean, headerText: string, descriptionText: string, children: React.ReactNode, icon: React.ReactNode, height?: string}) => {

    ///////////////////////////////////////////////////////////////////////////////
    // 2. STATE MANAGEMENT AND EFFECTS
    ///////////////////////////////////////////////////////////////////////////////

    // state to control the animation styling
    const [animate, setAnimate] = useState(false);
    // state to close the modal entirely
    const [closeModal, setCloseModal] = useState(false);

    // make the modal appear, allow the animation to play
    useEffect(() => {
        setTimeout(() => {
            setAnimate(true);
        }, 0);
    }, []);

    useEffect(() => {

        // allow time to display the out animation then close the modal
        if (!showInstructionsModal) {
            setAnimate(false);
            setTimeout(() => {
                setCloseModal(true);
            }, 100);

        // make the modal appear, allow the animation to play
        } else {
            setCloseModal(false);

            setTimeout(() => {
                setAnimate(true);

            }, 100);
        }

    }, [showInstructionsModal]);


    ///////////////////////////////////////////////////////////////////////////////
    // 3. COMPONENT RENDERING
    ///////////////////////////////////////////////////////////////////////////////

    if (!closeModal) {
    return (
        // Modal overlay with semi-transparent black background
        <div className={`fixed inset-0 bg-black/20 z-[101] h-screen w-screen flex flex-col items-center justify-center vp2:justify-center
        backdrop-blur-[2px]`}>
            {/* Modal container with primary background and brain icon decoration */}
            <div className={` my-4 ${height} relative bg-background/85 backdrop-blur-[2px] rounded-lg shadow-lg border border-foreground/5 overflow-hidden
            w-[calc(100%-2rem)] lg:w-auto mx-4 ${animate ? "sm:translate-y-0 translate-y-0 opacity-100" : "sm:translate-y-3 opacity-0 translate-y-5"} transition-all duration-300`}>

                {/* Background Icon */}
                <div className={`pointer-events-none absolute top-[10%] right-[-25%] h-[80%] w-[80%] flex items-center justify-center z-0
                transition-all duration-[350ms] group-hover:right-[-39%] group-hover:top-[18%] group-hover:h-[102%] group-hover:w-[102%]
                opacity-10
                `}>
                    {Icon}
                </div>
          
                {/* Close button */}
                <div className='absolute top-2 right-2 bg-white/10 rounded-full p-1 cursor-pointer z-[2]'>
                    <X className="w-4 h-4 text-foreground/70 dark:text-foreground/50" onClick={() => setShowInstructionsModal(false)} />
                </div>

                {/* Main content container */}
                <div className='h-full w-full flex flex-col justify-center px-4 pt-5 pb-5 relative overflow-hidden'>

                    {/* ///////////////////////////////////////////////////////////////////////////////
                    // 3.1 MODAL HEADER AND FEATURE INTRODUCTION
                    /////////////////////////////////////////////////////////////////////////////// */}

                    <div className="h-full">
                        <h3 className='text-foreground text-xl font-bold mb-3 sm:mb-0'>{headerText}</h3>
                        
                        <p className="hidden text-xs font-normal dark:font-light sm:flex text-foreground/70 dark:text-foreground/50 flex-row items-center justify-start gap-1 my-6 sm:my-2 flex-wrap">
                            {descriptionText}
                        </p>
                        {/* ///////////////////////////////////////////////////////////////////////////////
                        // 3.2 FEATURE INSTRUCTIONS LIST
                        /////////////////////////////////////////////////////////////////////////////// */}

                        <div className="border-t border-foreground/10 dark:border-foreground/5 space-y-4 ">
                            {children}
                        </div>


                    </div>

                    {/* ///////////////////////////////////////////////////////////////////////////////
                    // 3.4 ACTION BUTTONS
                    /////////////////////////////////////////////////////////////////////////////// */}



                </div>
          
            </div>
        </div>
    )
    }
}

export default InstructionsModalListings
